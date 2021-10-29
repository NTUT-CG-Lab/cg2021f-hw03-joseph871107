import * as THREE from '../build/three.module.js';
import { MouseRaycaster } from './mouseRaycaster.js';
import { ModelVpdLoader } from './modelVpdLoader.js';
import { ModelVpdGui } from './modelVpdGui.js';
import { PmxEditor } from './pmxEditor.js';

export class EditorManager{
    constructor(renderer, scene, camera, cameraControls, gui){
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
		this.cameraControls = cameraControls;
		this.gui = gui;

        this.editors = [];
        this.editor;

		this.scale = 30;
		this.zoomState = false;
        this.mouseRaycaster = new MouseRaycaster(scene, camera, renderer.domElement);
        this.modelList = EditorManager.readJson('model_list.json');
        this.currentModelIndex = 3;

        const modelIndexGui = gui.addFolder('Model');
        const controls = { index: -1 };
        const files = { };

        for (let i = 0; i < this.modelList.modellist.length; i++) {
            var basename = ModelVpdGui.getBaseName(this.modelList.modellist[i].location);
            controls[basename] = false;
            files[basename] = basename.split('.')[0];
        }
        modelIndexGui.add(controls, 'index', files).onChange(() => this.onChangeModel(this));
        modelIndexGui.open();
        this.modelIndexGui = modelIndexGui;
        this.controls = controls;
        
        const vpdFiles = [
            'models/mmd/vpds/01.vpd',
            'models/mmd/vpds/02.vpd',
            'models/mmd/vpds/03.vpd',
            'models/mmd/vpds/04.vpd',
            'models/mmd/vpds/05.vpd',
            'models/mmd/vpds/06.vpd',
            'models/mmd/vpds/07.vpd',
            'models/mmd/vpds/08.vpd',
            //'models/mmd/vpds/09.vpd',
            //'models/mmd/vpds/10.vpd',
            'models/mmd/vpds/11.vpd'
        ];
        this.vpdLoader = new ModelVpdLoader(vpdFiles);

        var scope = this;
        var process = function (pmxEditor, flag) {
            var currentMesh = pmxEditor.modelLoader.model;
            currentMesh.object3D.position.y = - 10;
            scope.editors.push(pmxEditor);
            
            if (flag){
                pmxEditor.show();
                scope.editor = pmxEditor;

                scope.controls.index = pmxEditor.modelLoader.name;
                scope.modelIndexGui.updateDisplay();
            }
        }
        for (let i = 0; i < this.modelList.modellist.length; i++){
            let modelFile = this.modelList.modellist[i];
            var editor = new PmxEditor(
                scene,
                camera,
                modelFile.location,
                this.mouseRaycaster,
                gui,
                this.vpdLoader,
                (pmxEditor) => process(pmxEditor, i==0)
            );
        }
    }

    static readJson(path){
        var request = new XMLHttpRequest();
        request.open("GET", path, false);
        request.send(null)
        var my_JSON_object = JSON.parse(request.responseText);
        return my_JSON_object;
    }

    static download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    zoom2Eye(index){
        this.scale = 1000;
        var offset = this.editor.getEyePosition(index);
        this.resizeCamera(offset);
    }

    zoom(index){
        this.cameraControls.reset();
        this.zoomState = !this.zoomState;
        if (this.zoomState){
            this.zoom2Eye(index);
        }
        else{
            this.scale = 30;
            this.resizeCamera();
        }
    }

    changeModel(index){
        this.editor.hide();
        this.editor = this.editors[index];
        this.editor.show();

        // zoomState = true;
        // zoom();
    }
    
    changeWithIncrement(increment){
        var length = this.editors.length;

        this.currentModelIndex = (this.currentModelIndex+increment) % length;
        if(this.currentModelIndex==-1)
        this.currentModelIndex = length-1;

        this.changeModel(this.currentModelIndex);
        this.controls.index = this.editor.modelLoader.name;
        this.modelIndexGui.updateDisplay();
    }

    onChangeModel(scope) {
        const index = scope.editors.findIndex((editor) => editor.modelLoader.name == scope.controls.index);
        this.changeModel(index);
    }

    updateModelList(){
        var modelList = this.modelList.modellist;
        for(var i=0; i<modelList.length; i++){
            modelList[i] = this.editors[i].toJSON();
        }
    }

    resizeCamera(offset = new THREE.Vector3(0, 0, 0)){
        this.camera.left = window.innerWidth / this.scale / - 2 + offset.x;
        this.camera.right = window.innerWidth / this.scale / 2 + offset.x;
        this.camera.top = window.innerHeight / this.scale / 2 + offset.y;
        this.camera.bottom = window.innerHeight / this.scale / - 2 + offset.y;
        this.camera.updateProjectionMatrix();
    }

    onMouseMove() {
        if (this.editor)
        this.editor.onMouseMove();
    }

    onMouseDown() {
        if (this.editor)
        this.editor.onMouseDown();
    }

    onKeyDown(event){
        var key = event.key;

        if (this.editor)
        this.editor.onKeyDown(event);
        switch(key){
            case 'a':
                this.changeWithIncrement(-1);
                break
            case 'd':
                this.changeWithIncrement(1);
                break
            case 'e':
                this.zoom(0);
                break
            case 's':
                this.updateModelList();
                EditorManager.download(JSON.stringify(this.modelList, null, 4), 'model_data.json', 'text/plain');
                break;
            case 'l':
                var scope = this;
                var input = document.createElement('input');
                input.type = 'file';
                input.setAttribute('accept', 'application/json')
                input.click();
                input.onchange = function(event) {
                    var fileList = input.files;
                    var fr=new FileReader();
                    fr.onload=function(){
                        scope.modelList = JSON.parse(fr.result);
                        for(var thisEditor of scope.editors){
                            thisEditor.fromJSON(scope.modelList.modellist.find((a)=>a.location==thisEditor.modelPath), scope.scene, scope.camera, scope.mouseRaycaster, scope.gui, scope.vpdLoader);
                        }
                        scope.editor.eyeLabelSystem.show();
                    }
                    
                    fr.readAsText(fileList[0]);
                }
                break
        }
    }
};