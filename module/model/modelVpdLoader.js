import { BasicLoader } from './modelLoader.js';

export class ModelVpdLoader{
    constructor(vpdFiles, callback = function(){}){
        this.vpdFiles = vpdFiles;
        this.callback = callback;

        const vpds = [];
        let vpdIndex = 0;
        var scope = this;

        function loadVpd() {
            const vpdFile = vpdFiles[vpdIndex];

            BasicLoader.loader.loadVPD(vpdFile, false, function (vpd) {
                vpds.push(vpd);

                vpdIndex++;

                if (vpdIndex < vpdFiles.length) {
                    loadVpd();
                } else {
                    scope.callback(scope);
                }
            }, (xhr) => BasicLoader.onProgress(xhr, 'ModelVpdLoader : '), null);
        }
        loadVpd();

        this.vpds = vpds;
    }
}