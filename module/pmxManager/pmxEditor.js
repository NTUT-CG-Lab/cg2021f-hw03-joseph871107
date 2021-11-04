import * as THREE from '../../build/three.module.js';
import { EyeLabelSystem } from '../eyesManager/eyeLabelSystem.js';
import { ModelLoader } from '../model/modelLoader.js';
import { ModelVpdGui } from '../model/modelVpdGui.js';

export class PmxEditor{
    constructor(scene, camera, modelPath, callback=function(){}, modelLoader = null){
        this.scene = scene;
        this.camera = camera;
        this.modelPath = modelPath;
        this.callback = callback;

        this.initialized = false;
		this.eyeLabelSystem;
		this.eyes = [];

        var scope = this;
        function process(modelLoader, scene) {
            scope.modelLoader = modelLoader;
            scope.eyeLabelSystem = new EyeLabelSystem(scene);
            scope.initialized = true;
            scope.callback(scope);
        }

        if (modelLoader){
            process(modelLoader.clone(scene), scene);
        }else{
            this.modelLoader = new ModelLoader(
                this.modelPath,
                this.scene,
                (modelLoader) => process(modelLoader, scope.scene)
            );
        }
    }

    static getWorldPosition = function(obj3D){
        if (obj3D){
            var target = new THREE.Vector3();
            return obj3D.getWorldPosition( target );
        }else{
            return new THREE.Vector3();
        }
    }

    dispose(){
        this.modelLoader.dispose();
        this.eyeLabelSystem.dispose();

        this.scene = null;
        this.camera = null;
        this.modelPath = null;
        this.callback = null;
        this.initialized = null;
        this.eyeLabelSystem = null;
        this.eyes = null;
    }

    set mouseRaycaster(mouseRaycaster){
        this.eyeLabelSystem.mouseRaycaster = mouseRaycaster;
    }

    getZoomParams(type='avg'){
        this.scale = 30;
        this.offset = new THREE.Vector3();

        switch(type){
            case 'avg':
                this.scale = 250;
                this.offset = this.getAveragePosition();
                break;
            case 'left_eye':
                this.scale = 1000;
                this.offset = this.getEyePosition(1);
                break;
            case 'right_eye':
                this.scale = 1000;
                this.offset = this.getEyePosition(0);
                break;
        }

        this.camera.position.z = 25;
        var params = {
            'scale': this.scale,
            'offset': this.offset,
            'update': function(){
                this.width = window.innerWidth;
                this.height = window.innerHeight;
        }};
        params.update();
        return params;
    }
    
    updateEyes(){
        var objs = [
            this.modelLoader.model.findBone("左目"),
            this.modelLoader.model.findBone("右目")
        ];
        this.eyes = objs;
    }

    getAveragePosition(){
        this.updateEyes();
        
        var total = new THREE.Vector3();
        this.eyes.forEach((obj) => {
            var pos = PmxEditor.getWorldPosition(obj);
            total.add(pos);
        });
        total = total.multiplyScalar(1 / (this.eyes.length ? this.eyes.length : 1));
        return total;
    }

    getEyePosition(index){
        this.updateEyes();

        if (index >= this.eyes.length)
            index = this.eyes.length - 1;
        if (index < 0)
            index = 0;

        return PmxEditor.getWorldPosition(this.eyes[index].children[0]);
    }

    updateEyePosition(index, pos, horizontal){
        var eye = this.eyes[index];
        
        var rotation;
        var rotation = new THREE.Vector3(
            horizontal ? pos.x: 0,
            horizontal ? 0 : -pos.y,
            0
        ).multiplyScalar(1/3).multiplyScalar(Math.PI);

        // var bbox = this?.eyeLabelSystem?.getBbox(index);
        // if (bbox.containsPoint(pos.clone())){
            eye.rotation.x = rotation.y;
            eye.rotation.y = rotation.x;
        // }
        return eye.rotation;
    }

    hide(){
        this.modelLoader.model.hide();
        this.eyeLabelSystem.hide();
    }

    show(){
        this.modelLoader.model.show();
        // this.eyeLabelSystem.show();
    }

    onMouseMove(event) {
        this.eyeLabelSystem.update();
    }

    onMouseDown(event) {
        this.eyeLabelSystem.mouseDown();
    }

    onKeyDown(event){
        /*
        var key = event.key;
        switch(key){
            case 'q':
                if (this.eyeLabelSystem)
                    this.eyeLabelSystem.showRight();
                break
            case '1':
            case '2':
            case '3':
            case '4':
                var index = parseInt(key)-1;
                this.updateEyes();
                this?.eyeLabelSystem?.keyDown(index);
                break
        }
        */
    }

    toJSON(){
        return Object.assign({location: this.modelPath}, this.eyeLabelSystem.toJSON());
    }

    fromJSON(serialize, scene){
        this.eyeLabelSystem.fromJSON(serialize, scene);
    }
};