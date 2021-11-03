import { MouseRaycaster } from '../basic/mouseRaycaster.js';
import { PmxEditorContainer } from './pmxEditorContainer.js';
import { ModelLoader } from '../model/modelLoader.js';
import { Camera } from '../basic/camera.js';

export class SplitFiveEditor{
    constructor(renderer, effect, modelPath, callback){
        this.renderer = renderer;
        this.effect = effect;
        this.modelPath = modelPath;
        this.callback = callback;

        this.containers = new Array(4);
        var scope = this;

        var process = function (container, index) {
            scope.containers[index] = container;

            container.show();
            container.morph(9, Math.random());
            
            
            if (index == 0){
                scope.mode = 0;
                scope.name = scope.container.editor.modelLoader.name;
            }

            // container.zoom('left_eye');
            // container.zoom('right_eye');
            container.zoom('avg');

            scope.callback(scope);
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

    set mode(mode){
        this._mode = mode;
        this.container = this.containers[Math.floor(mode/2)];
        this.showEyeLabelCurrentMode();
    }

    get mode(){
        return this._mode;
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
        var eyeIndex = this.mode % 2;
        this?.container?.editor?.eyeLabelSystem?.singleShow(eyeIndex);
    }

    zoomCurrentMode(){
        var eyeIndex = this.mode % 2;
        this.zoom(eyeIndex == 1 ? 'right_eye' : 'left_eye');
    }

    onWindowResize(event) {
        for(var thisContainer of this.containers)
            if (thisContainer)
                thisContainer.onWindowResize(event);
        
        this.zoomCurrentMode();
    }

    onMouseMove(event) {
        this?.container?.onMouseMove(event);
    }

    onMouseDown(event) {
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
        return this.container.editor.toJSON();
    }

    fromJSON(serialize){
        for(var thisContainer of this.containers)
            if (thisContainer)
                thisContainer.fromJSON(serialize, thisContainer.scene);
        this.showEyeLabelCurrentMode();
    }
}