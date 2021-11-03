import * as THREE from '../build/three.module.js';

import { GUI } from '../jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { OutlineEffect } from '../jsm/effects/OutlineEffect.js';

import { EditorManager } from './editorManager.js';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let scene, renderer, effect, editors;
let camera;

export class MainApp{
    constructor(){
        this.init();
    }
    
    init() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        renderer.autoClear = false;
        effect = new OutlineEffect(renderer);

        const gui = new GUI();
        editors = new EditorManager(renderer, effect, gui);
        gui.closed = true;

        window.addEventListener('resize', this.onWindowResize);
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        document.addEventListener("keydown", this.onDocumentKeyDown, false);
    }

    onWindowResize(event) {
        editors.onWindowResize(event);
    }

    onDocumentMouseMove(event) {
        editors.onMouseMove(event);
    }

    onDocumentMouseDown(event) {
        editors.onMouseDown(event);
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
        renderer.setClearColor( 0xffffff, 1);
        editors.render();
    }
}