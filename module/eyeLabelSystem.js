import * as THREE from '../build/three.module.js';
import { EyePairBorderLine } from './eyePairBorderLine.js';

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

    constructor(scene, mouseRaycaster){
        this.initialize(scene, mouseRaycaster);
    }

    initialize(scene, mouseRaycaster){
        this.scene = scene;
        this.mouseRaycaster = mouseRaycaster;

        this.eyePairBorders = new Array(4);
        this.state = EyeLabelSystem.states.idle;
    }

    dispose(){
        for(var eyePairBorders of this.eyePairBorders)
            if (eyePairBorders)
                eyePairBorders.dispose()
    }

    replaceEyeLabel(index, mouse = this.mouseRaycaster.position){
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
    }

    labelEye(label = true, mouse){
        if (this.isLabeling){
            if (this.eyePairBorders[this.index]){
                this.eyePairBorders[this.index].dispose();
                delete this.eyePairBorders[this.index];
            }
            if (label){
                this.replaceEyeLabel(this.index, mouse);
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
        for(let eyePairBorders of this.eyePairBorders)
            if (eyePairBorders)
                eyePairBorders.hide();
    }

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

    clear(){
        for(let eyePairBorders of this.eyePairBorders){
            if (eyePairBorders)
                eyePairBorders.dispose();
        }
        this.eyePairBorders = new Array(4);
    }

    update(){
        var mouse = this.mouseRaycaster.position;
        if (this.isLabeling){
            var ptr = this.eyePairBorders[this.index];
            if (ptr.horizontal)
                ptr.Y = mouse.y;
            else
                ptr.X = mouse.x;
        }
    }

    updateBorder(camera){
        for(let eyePairBorders of this.eyePairBorders){
            if (eyePairBorders)
                eyePairBorders.updateBorder(camera);
        }
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

    fromJSON(serialize, scene, mouseRaycaster){
        this.dispose();
        this.initialize(scene, mouseRaycaster);
        for(var j=0; j< this.eyePairBorders.length; j++){
            if (`line_locationx_${j+1}` in serialize && `line_locationy_${j+1}` in serialize){
                var mouse = new THREE.Vector2(serialize[`line_locationx_${j+1}`], serialize[`line_locationy_${j+1}`]);
                this.replaceEyeLabel(j, mouse);
            }
        }
    }
};