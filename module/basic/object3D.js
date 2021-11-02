export class Object3D{
    constructor(scene, object3D, name){
        this.scene = scene;
        this.object3D = object3D;
    }

    dispose(){
        this.hide();
        delete this.object3D;
    }

    hide(){
        this.scene.remove(this.object3D);
    }

    show(){
        this.scene.add(this.object3D);
    }

    resetPosition(){
        this.object3D.position.x = 0;
        this.object3D.position.y = 0;
        this.object3D.position.z = 0;
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