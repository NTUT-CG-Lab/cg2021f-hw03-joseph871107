import * as THREE from '../build/three.module.js';
import { EyeBorderLine } from './eyeBorderLine.js';

export class EyePairBorderLine{
    constructor(scene, mouse, start, end, color1=0xff0000, color2=0x0000ff, horizontal=true){
        this.scene = scene;
        var start2 = start.clone(), end2 = end.clone();
        if (horizontal){
            end2.x = -end2.x;
        }else{
            start2.x = -start2.x;
            end2.x = -end2.x;
        }
        this.leftEye = new EyeBorderLine(scene, start, end, color1);
        this.rightEye = new EyeBorderLine(scene, start2, end2, color2);
        
        this.mouse = mouse;
        this.horizontal = horizontal;
        this.showRightFlag = false;
    }

    dispose(){
        this.leftEye.dispose();
        this.rightEye.dispose();
    }

    show(){
        this.leftEye.show();
        if (this.showRightFlag)
            this.showRight();
    }

    showRight(){
        this.showRightFlag = true;
        this.rightEye.show();
    }

    hide(){
        this.leftEye.hide();
        this.rightEye.hide();
    }

    updateBorder(camera){
        var cameraPosition = new THREE.Vector3();

        var left = (camera.left) / camera.zoom + cameraPosition.x;
        var right = (camera.right) / camera.zoom + cameraPosition.x;
        var top = (camera.top) / camera.zoom + cameraPosition.y;
        var bottom = (camera.bottom) / camera.zoom + cameraPosition.y;

        if (this.horizontal){
            this.leftEye.X(right, 1);
            this.rightEye.X(left, 1);
        }else{
            this.leftEye.Y(top, 0);
            this.leftEye.Y(bottom, 1);
            this.rightEye.Y(top, 0);
            this.rightEye.Y(bottom, 1);
        }
    }

    set X(x){
        this.leftEye.X(x);
        this.rightEye.X(-x);
        this.mouse.x = x;
    }

    set Y(y){
        this.leftEye.Y(y);
        this.rightEye.Y(y);
        this.mouse.y = y;
    }
};