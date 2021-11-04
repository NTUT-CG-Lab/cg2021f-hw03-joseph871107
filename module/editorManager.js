import * as THREE from '../build/three.module.js';
import { MouseRaycaster } from './basic/mouseRaycaster.js';
import { ModelVpdLoader } from './model/modelVpdLoader.js';
import { ModelLoader } from './model/modelLoader.js';
import { ModelVpdGui } from './model/modelVpdGui.js';
import { PmxEditorContainer } from './pmxManager/pmxEditorContainer.js';
import { SplitFiveEditor } from './pmxManager/splitFiveEditor.js';

export class EditorManager{
    constructor(renderer, effect, gui){
        this.renderer = renderer;
        this.effect = effect;
		this.gui = gui;

        this.editors = [];
        this.editor;
        this.modelEditors = [];
        this.modelEditor;

		this.scale = 30;
		this.zoomState = false;
        this.modelList = EditorManager.readJson('model_list.json');
        try {
            this.modelList = EditorManager.readJson('model_data.json');
        } catch (error) {
            this.modelList = EditorManager.readJson('model_list.json');
        }          
        this._currentModelIndex = 0;

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
        
        // const vpdFiles = [
        //     'models/mmd/vpds/01.vpd',
        //     'models/mmd/vpds/02.vpd',
        //     'models/mmd/vpds/03.vpd',
        //     'models/mmd/vpds/04.vpd',
        //     'models/mmd/vpds/05.vpd',
        //     'models/mmd/vpds/06.vpd',
        //     'models/mmd/vpds/07.vpd',
        //     'models/mmd/vpds/08.vpd',
        //     //'models/mmd/vpds/09.vpd',
        //     //'models/mmd/vpds/10.vpd',
        //     'models/mmd/vpds/11.vpd'
        // ];
        // this.vpdLoader = new ModelVpdLoader(vpdFiles);

        var i = 0;
        for(var i=0; i<this.modelList.modellist.length; i++){
            this.createModelEditor(i);
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

    createModelEditor(index, callback=function(){}){
        var scope = this;

        new SplitFiveEditor(
            scope.renderer,
            scope.effect,
            scope.modelList.modellist[index].location,
            (modelEditor) => {
                scope.modelEditors[index] = modelEditor;
                if(index == 0){
                    scope.modelEditor = modelEditor;
                    scope.controls.index = modelEditor.name;
                    scope.modelIndexGui.updateDisplay();
                }
                callback(modelEditor);
            }
        )
    }

    changeModel(index){
        if (!this.modelEditors[index]){
            this.createModelEditor(index, (modelEditor)=> {
                this.modelEditor = this.modelEditors[index];
                this.modelEditor.onWindowResize();
            });
        }
        else{
            this.modelEditor = this.modelEditors[index];
            this.modelEditor.onWindowResize();
        }
    }

    set currentModelIndex(index){
        this._currentModelIndex = index;
        this.changeModel(index);
    }

    get currentModelIndex(){
        return this._currentModelIndex;
    }
    
    changeWithIncrement(increment){
        var length = this.modelList.modellist.length;

        var index = (this.currentModelIndex+increment) % length;
        if(index==-1)
            index = length-1;
        this.currentModelIndex = index;
        
        this.controls.index = this.modelEditor.name;
        this.modelIndexGui.updateDisplay();
    }

    onChangeModel(scope) {
        const index = scope.modelList.modellist.findIndex((model) => ModelLoader.getNameFromPath(model.location) == scope.controls.index);
        if (!(0 <= index && index < this.modelList.modellist.length))
            return;
        
        this.currentModelIndex = index;
    }

    updateModelList(){
        for(var i=0; i<this.modelList.modellist.length; i++){
            this.modelList.modellist[i] = this.modelEditors[i].toJSON();
        }
    }

    onWindowResize(event) {
        this?.modelEditor?.onWindowResize(event);
    }

    onMouseMove(event) {
        this?.modelEditor?.onMouseMove(event);
    }

    onMouseDown(event) {
        this?.modelEditor?.onMouseDown(event);
    }

    onKeyDown(event){
        this?.modelEditor?.onKeyDown(event);

        var key = event.key;

        switch(key){
            case 'a':
                this.changeWithIncrement(-1);
                break
            case 'd':
                this.changeWithIncrement(1);
                break
            case 'e':
                this.modelEditor.zoom();
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
                        var modelList = JSON.parse(fr.result);
                        scope.modelList = {'modellist':[]};
                        for(var thisModelEditor of scope.modelEditors){
                            var found = modelList.modellist.find((a)=>a.location==thisModelEditor.modelPath);
                            if (found){
                                thisModelEditor.fromJSON(found);
                                scope.modelList.modellist.push(found);
                            }
                        }
                    }
                    
                    fr.readAsText(fileList[0]);
                }
                break
        }
    }

    render(){
        if (this.modelEditor)
            this.modelEditor.render();
    }
};