import { MMDLoader } from '../../jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from '../../jsm/animation/MMDAnimationHelper.js';
import { MorphObject3D } from '../basic/morphObject3D.js';

export class BasicLoader{
    static loader = new MMDLoader();
    static helper = new MMDAnimationHelper();

    static onProgress(xhr, prefix = '') {
        if (xhr.lengthComputable) {
            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log(prefix + Math.round(percentComplete, 2) + '% downloaded');
        }
    }
};

export class ModelLoader{
    constructor(file, scene, callback = function(){}){
        this.file = file;
        this._scene = scene;
        this.callback = callback;

        if (file){
            this.name = ModelLoader.getNameFromPath(file);
            BasicLoader.loader.load(this.file, (obj) => {this.model = new MorphObject3D(this.scene, obj); this.callback(this);}, (xhr) => BasicLoader.onProgress(xhr, 'ModelLoader(' + this.name + ') : '), null);
        }
    }

    static getNameFromPath(path){
        return path.split('\\').pop().split('/').pop().split('.').shift();
    }

    clone(scene){
        var modelLoader = new ModelLoader(null, scene);
        modelLoader.file = this.file;
        modelLoader.name = this.name;
        modelLoader.model = this.model.clone(scene);
        return modelLoader;
    }

    set scene(scene){
        this._scene = scene;
        this.model.scene = scene;
    }

    get scene(){
        return this._scene;
    }

    dispose(){
        this.model.dispose();
        delete this.model;

        this.file = null;
        this._scene = null;
        this.callback = null;
        this.name = null;
        this.model = null;
    }
}