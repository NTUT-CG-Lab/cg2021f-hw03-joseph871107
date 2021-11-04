import * as THREE from '../../build/three.module.js';
import { MouseRaycaster } from '../basic/mouseRaycaster.js';
import { PmxEditorContainer } from './pmxEditorContainer.js';
import { ModelLoader } from '../model/modelLoader.js';
import { Camera } from '../basic/camera.js';
import { TetrahedronGeometry } from '../../build/three.module.js';

export class SplitFiveEditor{
    static states = Object.freeze(
        {
            'idle': 0,
            'start1': 1,
            'start2': 2,
        }
    )
    
    constructor(renderer, effect, modelPath, callback){
        this.renderer = renderer;
        this.effect = effect;
        this.modelPath = modelPath;
        this.callback = callback;

        this.containers = new Array(4);
        this.irisRotations = new Array(8);
        for(var i=0; i<this.irisRotations.length; i++){
            this.irisRotations[i] = [
                `${(i % 2)^1 ? 'R' : 'L'}${i < 4 ? 'X' : 'Y'}${(i % 4) < 2 ? 'N' : 'P'}A`,
                0,
                new THREE.Vector3(),
            ]
        }
        this.copyIrisLookupTable = [
            [0, 1],
            [2, 3],
            [4, 7],
            [5, 6],
        ];
        this.copyIrisLookupTable.findOther = function(index){
            var found = -1;
            this.forEach((pair) => {
                if (pair[0] == index)
                    found = pair[1];
                if (pair[1] == index)
                    found = pair[0];
            });
            return found;
        }

        var scope = this;

        var process = function (container, index) {
            scope.containers[index] = container;

            container.show();
            container.morph(9, Math.random());

            // container.zoom('left_eye');
            // container.zoom('right_eye');
            container.zoom('avg');

            scope.callback(scope);

            if (index == 0){
                scope.mode = 0;
                scope.name = scope.container.editor.modelLoader.name;
            }
        }

        
        new ModelLoader(
            this.modelPath,
            this.scene,
            (modelLoader) => {
                // Left top
                new PmxEditorContainer(
                    this.renderer,
                    this.effect,
                    this.modelPath,
                    function(SCREEN_WIDTH, SCREEN_HEIGHT){ this.setViewport(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2); },
                    (container) => {modelLoader.scene = container.scene; process(container, 0);},
                    modelLoader
                );
                
                // Right top
                new PmxEditorContainer(
                    this.renderer,
                    this.effect,
                    this.modelPath,
                    function(SCREEN_WIDTH, SCREEN_HEIGHT){ this.setViewport(SCREEN_WIDTH / 2 + SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2, SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2); },
                    (container) => {modelLoader.scene = container.scene; process(container, 1);},
                    modelLoader
                );
                
                // Left bottom
                new PmxEditorContainer(
                    this.renderer,
                    this.effect,
                    this.modelPath,
                    function(SCREEN_WIDTH, SCREEN_HEIGHT){ this.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2); },
                    (container) => {modelLoader.scene = container.scene; process(container, 2);},
                    modelLoader
                );
                
                // Right bottom
                new PmxEditorContainer(
                    this.renderer,
                    this.effect,
                    this.modelPath,
                    function(SCREEN_WIDTH, SCREEN_HEIGHT){ this.setViewport(SCREEN_WIDTH / 2 + SCREEN_WIDTH / 4, 0, SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2); },
                    (container) => {modelLoader.scene = container.scene; process(container, 3);},
                    modelLoader
                );
            }
        );
    }

    set state(flag){
        var activeState = this.index ? SplitFiveEditor.states.start1 : SplitFiveEditor.states.start2;
        this._state = flag ? activeState : SplitFiveEditor.states.idle;
    }

    get state(){
        return this._state;
    }

    get isMoving(){
        return (1 <= this.state && this.state <= 2);
    }

    set mode(mode){
        this._mode = mode;
        this.container = this.containers[Math.floor(mode/2)];
        this.showEyeLabelCurrentMode();
        this.state = false;
    }

    get mode(){
        return this._mode;
    }

    get eyeIndex(){
        return (this.mode % 2) ^ 1;
    }

    set container(container){
        if (this._container)
            this._container.editor.eyeLabelSystem.hide();
        this._container = container;
        this.updateMainCamera();
    }

    get container(){
        return this._container;
    }

    dispose(){
        for(var thisContainer of this.containers)
            if (thisContainer)
                thisContainer.dispose();
        
        this.renderer = null;
        this.effect = null;
        this.modelPath = null;
        this.callback = null;
        this.containers = null;
        this._container = null;
        this._mode = null;
        this.name = null;
        this.zoomParams = null;
        this.mainCamera = null;
    }

    zoom(type='left_eye', override_scale=null){
        this.zoomParams = this.container.editor.getZoomParams(type);
        if (override_scale)
            this.zoomParams.scale = override_scale;

        Camera.resizeCamera(this.mainCamera, this.zoomParams);
    }

    updateMainCamera(){
        if (!(0 <= this.mode && this.mode < 8))
            return;
        
        this.mainCamera = new Camera(this.container.scene, this.effect);
        this.mainCamera.position.z = 25;
        this.mainCamera.setViewportCal = function(SCREEN_WIDTH, SCREEN_HEIGHT){ this.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT); };
        this.zoomCurrentMode();

        this.mouseRaycaster = new MouseRaycaster(this.container.scene, this.mainCamera, this.renderer.domElement);
        this.container.mouseRaycaster = this.mouseRaycaster;
    }

    showEyeLabelCurrentMode(){
        this?.container?.editor?.eyeLabelSystem?.singleShow(this.eyeIndex);
    }

    zoomCurrentMode(){
        this.zoom(this.eyeIndex == 0 ? 'right_eye' : 'left_eye');
    }

    onWindowResize(event) {
        for(var thisContainer of this.containers)
            if (thisContainer)
                thisContainer.onWindowResize(event);
        
        this.zoomCurrentMode();
    }

    updateCurrentEyePosition(index = this.mode, other=null){
        function euler2Vector3(euler){
            return euler.toVector3().multiplyScalar(-180 / Math.PI);
        }

        var eyeIndex = (index % 2)^1;
        var pos;
        switch(index){
            // Vertical movement
            case 0:
            case 1:
            case 2:
            case 3:
                if (other){
                    pos = other;
                }else{
                    pos = this.mouseRaycaster.position.clone().sub(this.lastPos);
                }

                var euler = this
                    ?.container
                    ?.editor
                    ?.updateEyePosition(eyeIndex, pos, false);

                this.irisRotations[index][1] = euler2Vector3(euler).x;
                this.irisRotations[index][2] = pos;
                break;
            // Horizontal movement
            case 4:
            case 5:
            case 6:
            case 7:
                if (other){
                    pos = other.multiplyScalar(-1);
                }else{
                    pos = this.mouseRaycaster.position.clone().sub(this.lastPos);
                }

                var euler = this
                    ?.container
                    ?.editor
                    ?.updateEyePosition(eyeIndex, pos, true);

                this.irisRotations[index][1] = euler2Vector3(euler).y;
                this.irisRotations[index][2] = pos;
                break;
        }
    }

    onMouseMove(event) {
        this?.container?.onMouseMove(event);
        if (this.isMoving)
            this.updateCurrentEyePosition();
    }

    onMouseDown(event) {
        var key = event.keyCode || event.which;
        this.lastPos = this.mouseRaycaster.position.clone();
        switch(key){
            case 1: //Left
                this.state = true;
                break;
            case 3: //Right
                this.state = false;
                break;
        }

        this?.container?.onMouseDown(event);
    }

    onKeyDown(event){
        var key = event.key;

        switch(key){
            case '1':
                var mode = (this.mode - 1) % 8;
                if (mode == -1)
                    mode = 8;
                this.mode = mode;
                break;
            case '2':
                var mode = (this.mode + 1) % 8;
                this.mode = mode;
                break;
            case 'q':
                var original = this.mode;
                var other = this.copyIrisLookupTable.findOther(original);
                this.mode = other;
                this.updateCurrentEyePosition(other, this.irisRotations[original][2]);
                break;
        }

        // this?.container?.onKeyDown(event);
    }

    render(){
        for(var thisContainer of this.containers)
            if (thisContainer)
                thisContainer.render();
        this.mainCamera.render();
    }

    toJSON(){
        var json = {};
        this.irisRotations.forEach((pair) => {
            json[pair[0]] = pair[1];
        });
        json = Object.assign(this.container.editor.toJSON(), json);
        return json;
    }

    fromJSON(serialize){
        for(var thisContainer of this.containers)
            if (thisContainer)
                thisContainer.fromJSON(serialize, thisContainer.scene);
        this.showEyeLabelCurrentMode();
    }
}