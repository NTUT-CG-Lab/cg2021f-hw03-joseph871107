import * as THREE from '../../build/three.module.js';

export class MouseRaycaster{
    constructor(scene, camera, listeningTarget){
        this.scene = scene;
        this.camera = camera;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        
        listeningTarget.addEventListener('mousemove', (event) => this.update(event), false);
    }
    
    getMousePositionFromCamera(mouse){
        var mv = new THREE.Vector3(
            mouse.x,
            mouse.y,
            0.5 );
        this.raycaster.setFromCamera(mv, this.camera);
        var intersects = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, intersects);

        return intersects;
    }

    get position(){
        return this.getMousePositionFromCamera(this.mouse)
    }

    update(event){
        var x = event.clientX;
        var y = window.innerHeight - event.clientY - 1;

        if (this.camera){
            var width = this.camera.viewport.width;
            var height = this.camera.viewport.height;
            var left = this.camera.viewport.x;
            var right = this.camera.viewport.x + width;
            var bottom = this.camera.viewport.y;
            var top = this.camera.viewport.y + height;

            if (left <= x && x <= right && bottom <= y && y <= top){
                this.mouse.x = ((x - left) / width) * 2 - 1;
                this.mouse.y = ((y - bottom) / height) * 2 - 1;
            }
        }
    }
};