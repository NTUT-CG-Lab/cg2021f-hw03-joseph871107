import { MMDLoader } from '../jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from '../jsm/animation/MMDAnimationHelper.js';
import { Object3D } from './object3D.js';

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
        this.scene = scene;
        this.callback = callback;
        this.name = file.split('\\').pop().split('/').pop().split('.').shift();

        BasicLoader.loader.load(this.file, (obj) => {this.model = new Object3D(this.scene, obj); this.callback(this);}, (xhr) => BasicLoader.onProgress(xhr, 'ModelLoader : '), null);
    }
}