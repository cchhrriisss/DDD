import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
// In a real app, you'd use a GLTFLoader for your model
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.getElementById('item-canvas');
if (canvas) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7); // Match the container background

    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Placeholder for the main model
    const placeholderGeo = new THREE.TorusKnotGeometry(0.8, 0.2, 128, 16);
    const placeholderMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6, metalness: 0.2 });
    const mainModel = new THREE.Mesh(placeholderGeo, placeholderMat);
    scene.add(mainModel);

    // --- Personalization Logic ---
    const textField = document.getElementById('personalize-text');
    const applyBtn = document.getElementById('personalize-apply');
    let customTextObject = null;
    const fontLoader = new FontLoader();
    let helvetikerFont;
    
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        helvetikerFont = font;
        applyBtn.disabled = false;
    });

    applyBtn.addEventListener('click', () => {
        if (!helvetikerFont || !textField.value) return;
        if (customTextObject) scene.remove(customTextObject);
        
        const textGeo = new TextGeometry(textField.value, { font: helvetikerFont, size: 0.2, height: 0.02 });
        textGeo.center();
        const textMat = new THREE.MeshStandardMaterial({ color: 0x1d1d1f });
        customTextObject = new THREE.Mesh(textGeo, textMat);
        
        customTextObject.position.set(0, 0, 1.1); // Position text in front of the model
        scene.add(customTextObject);
    });
    applyBtn.disabled = true;


    function animate() {
        requestAnimationFrame(animate);
        controls.update();

        const { clientWidth, clientHeight } = renderer.domElement.parentElement;
        if (renderer.domElement.width !== clientWidth || renderer.domElement.height !== clientHeight) {
            renderer.setSize(clientWidth, clientHeight, false);
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
    }
    animate();
}