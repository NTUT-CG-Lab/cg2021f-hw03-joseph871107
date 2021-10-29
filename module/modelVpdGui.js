import { BasicLoader } from './modelLoader.js';

export class ModelVpdGui{
    constructor(modelLoader, modelVpdLoader, gui, callback = function(){}){
        this.modelLoader = modelLoader;
        this.modelVpdLoader = modelVpdLoader;
        this.gui = gui;
        this.callback = callback;

        this.initGui();
        this.callback(this);
    }

    static getBaseName(s) {
        return s.slice(s.lastIndexOf('/') + 1);
    }

    initGui() {
        const gui = this.gui;

        const dictionary = this.modelLoader.model.object3D.morphTargetDictionary;

        const controls = {};
        const keys = [];

        const model = gui.addFolder(this.modelLoader.name);
        const poses = model.addFolder('Poses');
        const morphs = model.addFolder('Morphs');

        var scope = this;

        function initControls() {
            for (const key in dictionary) {
                controls[key] = 0.0;
            }

            controls.pose = - 1;

            for (let i = 0; i < scope.modelVpdLoader.vpdFiles.length; i++) {
                controls[ModelVpdGui.getBaseName(scope.modelVpdLoader.vpdFiles[i])] = false;
            }
        }

        function initKeys() {
            for (const key in dictionary) {
                keys.push(key);
            }
        }

        function initPoses() {
            const files = { default: - 1 };

            for (let i = 0; i < scope.modelVpdLoader.vpdFiles.length; i++) {
                files[ModelVpdGui.getBaseName(scope.modelVpdLoader.vpdFiles[i])] = i;
            }

            poses.add(controls, 'pose', files).onChange(onChangePose);
        }

        function initMorphs() {
            for (const key in dictionary) {
                morphs.add(controls, key, 0.0, 1.0, 0.01).onChange(onChangeMorph);
            }
        }

        function onChangeMorph() {
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = controls[key];
                scope.modelLoader.model.object3D.morphTargetInfluences[i] = value;
            }
        }

        function onChangePose() {
            const index = parseInt(controls.pose);

            if (index === - 1) {
                scope.modelLoader.model.object3D.pose();
            } else {
                BasicLoader.helper.pose(scope.modelLoader.model.object3D, scope.modelVpdLoader.vpds[index]);
            }
        }

        initControls();
        initKeys();
        initPoses();
        initMorphs();

        onChangeMorph();
        onChangePose();

        // model.open();
        // poses.open();
        // morphs.open();

        this.gui = {
            model: model,
            poses: poses,
            morphs: morphs,
        }
    }

    set guiShow(flag){
        if (flag){
            this.gui.model.open();
            this.gui.poses.open();
            this.gui.morphs.open();
        }else{
            this.gui.model.close();
            this.gui.poses.close();
            this.gui.morphs.close();
        }
    }
}