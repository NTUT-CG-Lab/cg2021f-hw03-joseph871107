import * as THREE from '../../build/three.module.js';

export class Camera extends THREE.OrthographicCamera{
    constructor(scene, renderer, left, right, top, bottom, near, far){
        super(left, right, top, bottom, near, far);

        this.scene = scene;
        this.renderer = renderer;
        this.setViewportCal = function(){};
        this.setViewport(0, 0, window.innerWidth, window.innerHeight);
    }

    static resizeCamera(camera, resizeParams){
        camera.setViewportCal(resizeParams.width, resizeParams.height);
        camera.resize(resizeParams.scale, resizeParams.offset);
    }

    setViewport(x, y, width, height){
        this.viewport = {
            x: x,
            y: y,
            width: width,
            height: height,
        };
        this.resize(1);
    }

    render(){
        this.renderer.setViewport(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
        this.renderer.render(this.scene, this);
    }

    resize(scale, offset = new THREE.Vector3(0, 0, 0)){
        this.left = this.viewport.width / scale / - 2 + offset.x;
        this.right = this.viewport.width / scale / 2 + offset.x;
        this.top = this.viewport.height / scale / 2 + offset.y;
        this.bottom = this.viewport.height / scale / - 2 + offset.y;
        this.updateProjectionMatrix();
    }
}