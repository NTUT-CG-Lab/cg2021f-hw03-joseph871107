import { Object3D } from "./object3D.js"
import * as SkeletonUtils from "../../jsm/utils/SkeletonUtils.js"

export class MorphObject3D extends Object3D{
    constructor(scene, object3D){
        super(scene, object3D);
    }

    get morphLength(){
        if (this?.object3D?.morphDictionary)
            return Object.keys(this.object3D.morphDictionary).length;
        else
            return 0;
    }

    dispose(){
        super.dispose();
    }

    clone(scene){
        return new MorphObject3D(scene, SkeletonUtils.clone(this.object3D));
    }

    morph(index, value){
        if (0 <= index && index < this.morphLength){
            this.object3D.morphTargetInfluences[imdex] = value;
        }
    }
};