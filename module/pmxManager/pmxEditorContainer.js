import * as THREE from '../../build/three.module.js';
import { Camera } from '../basic/camera.js';
import { PmxEditor } from './pmxEditor.js';

export class PmxEditorContainer{
    constructor(renderer, effect, modelPath, cameraViewportFunc, callback=function(){}, modelLoader = null){
        this.renderer = renderer;
        this.effect = effect;
        this.modelPath = modelPath;
        this.cameraViewportFunc = cameraViewportFunc;
        this.callback = callback;

        this._initializeScene();
        this._initializeCamera();
        
        var scope = this;
        var process = function (pmxEditor, index) {
            pmxEditor.modelLoader.model.object3D.position.y = - 10;
            scope.morph = pmxEditor.modelLoader.model.morph;
            scope.editor = pmxEditor;

            callback(scope);
        }
        new PmxEditor(
            this.scene,
            this.camera,
            this.modelPath,
            (pmxEditor) => process(pmxEditor, 0),
            modelLoader
        );
    }

    dispose(){
        this.editor.dispose();
        
        this.renderer = null;
        this.effect = null;
        this.modelPath = null;
        this.cameraViewportFunc = null;
        this.callback = null;

        this.scene = null;
        this.camera = null;
        this.editor = null;
    }

    set mouseRaycaster(mouseRaycaster){
        this.editor.mouseRaycaster = mouseRaycaster;
    }

    _initializeScene(){
        let scene;
        scene = new THREE.Scene();

        const ambient = new THREE.AmbientLight(0x666666);
        scene.add(ambient);

        const directionalLight = new THREE.DirectionalLight(0x887766);
        directionalLight.position.set(- 1, 1, 1).normalize();
        scene.add(directionalLight);

        this.scene = scene;
    }

    _initializeCamera(){

        this.scale = 30;
        this.camera = new Camera(this.scene, this.effect);
        this.camera.setViewportCal = this.cameraViewportFunc;
    }

    zoom(type='avg'){
        this.zoomParams = this.editor.getZoomParams(type);
        this.onWindowResize();
    }

    hide(){
        this.editor.hide();
    }

    show(){
        this.editor.show();
    }

    showEyeLabel(){
        this.editor.eyeLabelSystem.show();
    }

    onWindowResize(event) {
        this.zoomParams.update();
        Camera.resizeCamera(this.camera, this.zoomParams);

        this.effect.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this?.editor?.onMouseMove(event);
    }

    onMouseDown(event) {
        this?.editor?.onMouseDown(event);
    }

    onKeyDown(event){
        this?.editor?.onKeyDown(event);
    }

    render() {
        this.camera.render();
    }

    toJSON(){
        return this.editor.toJSON();
    }

    fromJSON(serialize){
        this.editor.fromJSON(serialize, this.scene)
    }
}