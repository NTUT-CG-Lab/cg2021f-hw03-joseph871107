import * as THREE from '../../build/three.module.js';
import { EyePairBorderLine } from './basic/eyePairBorderLine.js';

export class EyeLabelSystem{
    static states = Object.freeze(
        {
            'idle': 0,
            'start1': 1,
            'start2': 2,
            'start3': 3,
            'start4': 4,
        }
    )

    constructor(scene){
        this.initialize(scene);
    }

    initialize(scene){
        this.scene = scene;

        this.sliceSize = new THREE.Vector2(4, 8);
        this.clear();

        this.state = EyeLabelSystem.states.idle;
    }

    disposeEyeLabels(){
        if (this.eyePairBorders){
            this?.eyePairBorders?.forEach((eyePairBorders) => {
                if (eyePairBorders)
                    eyePairBorders.dispose();
            });
            this.eyePairBorders = null;
        }
        if (this.eyePairBordersMiddle){
            this?.eyePairBordersMiddle?.forEach((middles) => {
                for(let middle of middles){
                    if (middle)
                        middle.dispose();
                }
            });
            this.eyePairBordersMiddle = null;
        }
    }

    replaceEyeLabel(index, mouse = this.mouse){
        if (!mouse)
            return false;

        if (this.eyePairBorders[index])
            this.eyePairBorders[index].dispose();

        var center = new THREE.Vector3();
        var start, end, color1, color2;
        const z = 24;
        const max = 100000;
        const min = -max;
        switch(index){
            case 0:
            case 2:
                start = new THREE.Vector3(center.x, mouse.y, z);
                end = new THREE.Vector3(max, mouse.y, z);
                color1 = 0xff0000;
                color2 = 0xff00ff;
                break
            case 1:
            case 3:
                start = new THREE.Vector3(mouse.x, min, z);
                end = new THREE.Vector3(mouse.x, max, z);
                color1 = 0x00ff00;
                color2 = 0x00ffff;
                break
        }
        this.eyePairBorders[index] = new EyePairBorderLine(this.scene, mouse, start, end, color1, color2, (index == 0 || index == 2));
        
        if (this.eyePairBorders[0] && this.eyePairBorders[2] && (index == 0 || index == 2)){
            var ys = [this.eyePairBorders[0].mouse.y, this.eyePairBorders[2].mouse.y];
            var minY = Math.min.apply(Math, ys);
            var maxY = Math.max.apply(Math, ys);
            var size = this.sliceSize.x;
            var increment = (maxY - minY) / size;

            for(var i = 0; i < size - 1; i++){
                start.y = minY + increment * (i+1);
                end.y = minY + increment * (i+1);
                this.eyePairBordersMiddle[index % 2][i] = new EyePairBorderLine(this.scene, null, start, end, color1, color2, (index == 0 || index == 2));
            }
        }

        if (this.eyePairBorders[1] && this.eyePairBorders[3] && (index == 1 || index == 3)){
            var xs = [this.eyePairBorders[1].mouse.x, this.eyePairBorders[3].mouse.x];
            var minX = Math.min.apply(Math, xs);
            var maxX = Math.max.apply(Math, xs);
            var size = this.sliceSize.y;
            var increment = (maxX - minX) / size;

            for(var i = 0; i < size - 1; i++){
                start.x = minX + increment * (i+1);
                end.x = minX + increment * (i+1);
                this.eyePairBordersMiddle[index % 2][i] = new EyePairBorderLine(this.scene, null, start, end, color1, color2, (index == 0 || index == 2));
            }
        }
        
        return true;
    }

    labelEye(){
        if (this.isLabeling){
            if (this.eyePairBorders[this.index]){
                this.eyePairBorders[this.index].dispose();
                delete this.eyePairBorders[this.index];
            }
            if (this.replaceEyeLabel(this.index)){
                this.eyePairBorders[this.index].show();
            }
        }
    }

    keyDown(index){
        switch(this.state){
            case EyeLabelSystem.states.idle:
                this.state = this.getStateFrom(index);
                break
            case EyeLabelSystem.states.start1:
            case EyeLabelSystem.states.start2:
            case EyeLabelSystem.states.start3:
            case EyeLabelSystem.states.start4:
                // this.state = EyeLabelSystem.states.idle;
                break
        }
        this.labelEye();
    }

    mouseDown(){
        if (this.isLabeling){
            this.state = EyeLabelSystem.states.idle;
        }
    }

    getStateFrom(index){
        var state = EyeLabelSystem.states.idle;
        switch (index){
            case 0:
                state = EyeLabelSystem.states.start1;
                break
            case 1:
                state = EyeLabelSystem.states.start2;
                break
            case 2:
                state = EyeLabelSystem.states.start3;
                break
            case 3:
                state = EyeLabelSystem.states.start4;
                break
        }
        return state;
    }

    get index(){
        return this.state - 1;
    }

    get isLabeling(){
        return (0 <= this.index && this.index < 4);
    }

    hide(){
        this?.eyePairBorders?.forEach((eyePairBorders) => {
            if (eyePairBorders)
                eyePairBorders.hide();
        });
        this?.eyePairBordersMiddle?.forEach((middles) => {
            middles.forEach((middle) => {
                if (middle)
                    middle.hide();
            });
        });
    }

    /*
    show(){
        for(let eyePairBorders of this.eyePairBorders)
            if (eyePairBorders)
                eyePairBorders.show();
    }

    showRight(){
        let count = 0;
        for(let i = 0;i <this.eyePairBorders.length; i++)
            if (this.eyePairBorders[i])
                count++;
        if (count == 4)
            for(let eyePairBorders of this.eyePairBorders)
                eyePairBorders.showRight();
    }
    */

    singleShow(index){
        this?.eyePairBorders?.forEach((eyePairBorders) => {
            if (eyePairBorders)
                eyePairBorders.singleShow(index);
        });
        this?.eyePairBordersMiddle?.forEach((middles) => {
            middles.forEach((middle) => {
                if (middle)
                    middle.singleShow(index);
            });
        });
    }

    clear(){
        this.disposeEyeLabels();

        this.eyePairBorders = new Array(4);
        this.eyePairBordersMiddle = new Array(2);

        var sliceSizeArray = this.sliceSize.toArray();
        for(var i = 0; i < sliceSizeArray.length; i++){
            this.eyePairBordersMiddle[i] = new Array(sliceSizeArray[i] - 1);
        }
    }

    getBbox(index){
        var key = index == 0 ? 'leftEye' : 'rightEye';
        var xs = [];
        var ys = [];
        var z;
        this?.eyePairBorders?.forEach((eyePairBorders) => {
            var eyeObj = eyePairBorders?.[key];
            if (eyePairBorders.horizontal)
                ys.push(eyeObj.start.y);
            else
                xs.push(eyeObj.start.x);
        });

        return new THREE.Box2(
            new THREE.Vector2(
                Math.min.apply(Math, xs),
                Math.min.apply(Math, ys),
            ),
            new THREE.Vector2(
                Math.max.apply(Math, xs),
                Math.max.apply(Math, ys),
            ),
        );
    }

    get mouse(){
        if (this.mouseRaycaster)
            return this.mouseRaycaster.position;
        else
            return null;
    }

    update(){
        var mouse = this.mouse;
        if (this.isLabeling && mouse){
            var ptr = this.eyePairBorders[this.index];
            if (ptr.horizontal)
                ptr.Y = mouse.y;
            else
                ptr.X = mouse.x;
        }
    }

    updateBorder(camera){
        this?.eyePairBorders?.forEach((eyePairBorders) => {
            if (eyePairBorders)
                eyePairBorders.updateBorder(camera);
        });
    }

    toJSON(){
        var obj = {};
        for(var j=0; j< this.eyePairBorders.length; j++){
            var eyePairBorders = this.eyePairBorders[j];
            if (eyePairBorders){
                obj[`line_locationx_${j+1}`] = eyePairBorders.mouse.x;
                obj[`line_locationy_${j+1}`] = eyePairBorders.mouse.y;
            }
        }
        return obj;
    }

    fromJSON(serialize, scene){
        this.disposeEyeLabels();
        this.initialize(scene);
        for(var j=0; j< this.eyePairBorders.length; j++){
            if (`line_locationx_${j+1}` in serialize && `line_locationy_${j+1}` in serialize){
                var mouse = new THREE.Vector2(serialize[`line_locationx_${j+1}`], serialize[`line_locationy_${j+1}`]);
                this.replaceEyeLabel(j, mouse);
            }
        }
    }
};