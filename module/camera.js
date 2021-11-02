import * as THREE from '../build/three.module.js';

export class Camera extends THREE.OrthographicCamera{
    constructor(scene, effect, left, right, top, bottom, near, far){
        super(left, right, top, bottom, near, far);

        this.scene = scene;
        this.effect = effect;
    }

    setViewport(x, y, width, height){
        this.viewport = {
            x: x,
            y: y,
            width: width,
            height: height,
        };
    }

    render(){
        this.effect.setViewport(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
        this.effect.render(this.scene, this);
    }

    resize(scale, offset = new THREE.Vector3(0, 0, 0)){
        this.left = this.viewport.width / scale / - 2 + offset.x;
        this.right = this.viewport.width / scale / 2 + offset.x;
        this.top = this.viewport.height / scale / 2 + offset.y;
        this.bottom = this.viewport.height / scale / - 2 + offset.y;
        this.updateProjectionMatrix();
    }
}