module.exports = {
    sync: {
        dependencies: {
            // all files that need to be copied from /node_modules to /src/extensions/uv-virtex-extension/lib post npm install
            cwd: '<%= config.directories.npm %>',
            expand: true,
            flatten: true,
            src: [
                'virtex3d/dist/virtex.js',
                'iiif-metadata-component/dist/iiif-metadata-component.js',
                'three/build/three.min.js',
                'three/examples/js/controls/VRControls.js',
                'three/examples/js/effects/VREffect.js',
                'three/examples/js/libs/stats.min.js',
                'three/examples/js/loaders/draco_decoder.js',
                'three/examples/js/loaders/DRACOLoader.js',
                'three/examples/js/loaders/GLTFLoader.js',
                'three/examples/js/Detector.js',
                'three/examples/js/vr/WebVR.js'
            ],
            dest: '<%= config.directories.uvVirtexExtension %>/lib'
        }
    }
}