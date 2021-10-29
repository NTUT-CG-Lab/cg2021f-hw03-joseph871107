import * as THREE from '../build/three.module.js';
import { Object3D } from './object3D.js';

export class EyeBorderLine extends Object3D{
    static createLine(start, end, color){
        const material = new THREE.LineBasicMaterial( { color: color } );

        const points = [];
        points.push(start);
        points.push(end);

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, material );
        return material, geometry, line;
    }

    constructor(scene, start, end, color=0xff0000){
        var material, geometry, mesh = EyeBorderLine.createLine(start, end, color);
        super(scene, mesh);

        this.geometry = geometry;
        this.material = material;
        this.mesh = mesh;

        this.start = start;
        this.end = end;
        this.color = color;
    }

    updateGeometry(){
        this.object3D.geometry.attributes.position.needsUpdate = true;
    }

    getArrayIndexByOrientation(index, orientation){
        var orientation_encode = 0;
        switch(orientation){
            case 'x':
                orientation_encode = 0;
                break
            case 'y':
                orientation_encode = 1;
                break
            case 'z':
                orientation_encode = 2;
                break
        }
        return index * 3 + orientation_encode;
    }

    X(x, index=null){
        this.start.x = x;
        this.end.x = x;

        const positions = this.object3D.geometry.attributes.position.array;
        if (index){
            positions[this.getArrayIndexByOrientation(index, 'x')] = x;
        }else{
            positions[this.getArrayIndexByOrientation(0, 'x')] = x;
            positions[this.getArrayIndexByOrientation(1, 'x')] = x;
        }
        this.updateGeometry();
    }

    Y(y, index=null){
        this.start.y = y;
        this.end.y = y;

        const positions = this.object3D.geometry.attributes.position.array;
        if (index){
            positions[this.getArrayIndexByOrientation(index, 'y')] = y;
        }else{
            positions[this.getArrayIndexByOrientation(0, 'y')] = y;
            positions[this.getArrayIndexByOrientation(1, 'y')] = y;
        }
        this.updateGeometry();
    }
};