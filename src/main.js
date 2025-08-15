import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// This ensures all the code runs only after the HTML page is fully loaded.
document.addEventListener('DOMContentLoaded', () => {

    // --- GIMMICK 1: CURSOR LIGHT ---
    const light = document.getElementById('cursor-light');
    if (light) {
        window.addEventListener('mousemove', (e) => {
            light.style.left = `${e.clientX}px`;
            light.style.top = `${e.clientY}px`;
        });
            const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            document.body.classList.toggle('mobile-nav-open');
        });
    }
    }

    // --- GIMMICK 2: MAGNETIC BUTTONS ---
    const magneticButtons = document.querySelectorAll('.btn');
    if (magneticButtons.length) {
        const magneticStrength = 0.4;
        magneticButtons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                button.style.transition = 'transform 0.1s ease-out';
                button.style.transform = `translate(${x * magneticStrength}px, ${y * magneticStrength}px)`;
            });
            button.addEventListener('mouseleave', () => {
                button.style.transition = 'transform 0.3s ease-out';
                button.style.transform = 'translate(0,0)';
            });
        });
    }

    // --- HERO 3D VISUAL ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
        camera.position.z = 2.5;
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });

        const material = new THREE.MeshStandardMaterial({
            color: 0x2A2A3A,
            roughness: 0.5
        });

        const geometry = new THREE.IcosahedronGeometry(1.2, 1);
        const shape = new THREE.Mesh(geometry, material);
        scene.add(shape);

        // Professional lighting setup
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 2.5);
        scene.add(hemiLight);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(-5, 5, 5);
        scene.add(keyLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.autoRotate = true;
        controls.enableZoom = false;
        controls.enablePan = false;

        function animate() {
            requestAnimationFrame(animate);
            controls.update();

            // Responsive canvas logic
            const parent = renderer.domElement.parentElement;
            if (parent) {
                const { clientWidth, clientHeight } = parent;
                if (renderer.domElement.width !== clientWidth || renderer.domElement.height !== clientHeight) {
                    renderer.setSize(clientWidth, clientHeight, false);
                    camera.aspect = clientWidth / clientHeight;
                    camera.updateProjectionMatrix();
                }
            }
            
            renderer.render(scene, camera);
        }
        animate();
    }
});