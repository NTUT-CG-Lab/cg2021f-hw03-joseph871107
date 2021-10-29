import * as THREE from '../build/three.module.js';

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
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
};