import * as SkeletonUtils from "../../jsm/utils/SkeletonUtils.js"

export class Object3D{
    constructor(scene, object3D){
        this.scene = scene;
        this.object3D = object3D;
    }

    clone(scene){
        return new Object3D(scene, SkeletonUtils.clone(this.object3D));
    }

    dispose(){
        this.hide();
        
        this.scene = null;
        this.object3D = null;
    }

    hide(){
        this.scene.remove(this.object3D);
    }

    show(){
        this.scene.add(this.object3D);
    }

    resetPosition(){
        this.object3D.position.set(0, 0, 0);
    }
    
    findBone(name, obj = this.object3D){
        if ('name' in obj && obj.name == name){
            return obj;
        }
        else{
            if ('children' in obj){
                var found = [];
                for(var child of obj.children){
                    var result = this.findBone(name, child);
                    if (result != null)
                        found.push(result);
                }
                if (found.length == 0){
                    return null;
                }else{
                    return found[0];
                }
                return ;
            }else{
                return null;
            }
        }
    }
};