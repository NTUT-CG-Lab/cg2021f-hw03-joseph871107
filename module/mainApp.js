import * as THREE from '../build/three.module.js';

import { GUI } from '../jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { OutlineEffect } from '../jsm/effects/OutlineEffect.js';

import { EditorManager } from './editorManager.js';
import { Camera } from './basic/camera.js';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let scene, renderer, effect, editors;
let camera, camera2, camera3, camera4, camera5;

export class MainApp{
    constructor(){
        this.init();
    }
    
    init() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        // scene

        scene = new THREE.Scene();
        // scene.background = new THREE.Color(0xffffff);

        const ambient = new THREE.AmbientLight(0x666666);
        scene.add(ambient);

        const directionalLight = new THREE.DirectionalLight(0x887766);
        directionalLight.position.set(- 1, 1, 1).normalize();
        scene.add(directionalLight);

        //

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        renderer.autoClear = false;
        effect = new OutlineEffect(renderer);
        
        var scale = 30;
        // camera = new THREE.OrthographicCamera(window.innerWidth / scale / - 2, window.innerWidth / scale / 2, window.innerHeight / scale / 2, window.innerHeight / scale / - 2, 0.1, 1000);
        // //camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        // camera.position.z = 25;
        var frustumSize = scale;
        camera = new Camera(scene, effect, 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000);
        camera2 = new Camera(scene, effect, 0.25 * frustumSize * aspect / - 2, 0.25 * frustumSize * aspect / 2, 0.5 * frustumSize / 2, 0.5 * frustumSize / - 2, 0.1, 1000);
        camera3 = new Camera(scene, effect, 0.25 * frustumSize * aspect / - 2, 0.25 * frustumSize * aspect / 2, 0.5 * frustumSize / 2, 0.5 * frustumSize / - 2, 0.1, 1000);
        camera4 = new Camera(scene, effect, 0.25 * frustumSize * aspect / - 2, 0.25 * frustumSize * aspect / 2, 0.5 * frustumSize / 2, 0.5 * frustumSize / - 2, 0.1, 1000);
        camera5 = new Camera(scene, effect, 0.25 * frustumSize * aspect / - 2, 0.25 * frustumSize * aspect / 2, 0.5 * frustumSize / 2, 0.5 * frustumSize / - 2, 0.1, 1000);
        
        camera.position.z = 30;
        camera2.position.z = 30;
        camera3.position.z = 30;
        camera4.position.z = 30;
        camera5.position.z = 30;

        camera.setViewportCal = function(){ this.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT); };
        camera2.setViewportCal = function(){ this.setViewport(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2); };
        camera3.setViewportCal = function(){ this.setViewport(SCREEN_WIDTH / 2 + SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2, SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2); };
        camera4.setViewportCal = function(){ this.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2); };
        camera5.setViewportCal = function(){ this.setViewport(SCREEN_WIDTH / 2 + SCREEN_WIDTH / 4, 0, SCREEN_WIDTH / 4, SCREEN_HEIGHT / 2); };

        //鏡頭控制
        var cameraControls = new OrbitControls(camera, renderer.domElement);
        cameraControls.minDistance = 10;
        cameraControls.maxDistance = 100;
        cameraControls.enableRotate = false;

        const gui = new GUI();
        editors = new EditorManager(renderer, scene, camera, cameraControls, gui);
        this.onWindowResize();

        window.addEventListener('resize', this.onWindowResize);
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        document.addEventListener("keydown", this.onDocumentKeyDown, false);
    }

    onWindowResize() {
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

        function resizeCamera(camera){
            camera.setViewportCal();
            camera.resize(editors.scale);
        }
        resizeCamera(camera);
        resizeCamera(camera2);
        resizeCamera(camera3);
        resizeCamera(camera4);
        resizeCamera(camera5);

        effect.setSize(window.innerWidth, window.innerHeight);
    }

    onDocumentMouseMove() {
        editors.onMouseMove();
    }

    onDocumentMouseDown() {
        editors.onMouseDown();
    }

    onDocumentKeyDown(event){
        editors.onKeyDown(event);
    }

    animate() {
        requestAnimationFrame(()=>{this.animate()});
        this.render();
    }

    render() {
        effect.clear();

        camera.render();
        camera2.render();
        camera3.render();
        camera4.render();
        camera5.render();
    }
}