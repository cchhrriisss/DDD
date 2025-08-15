import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

class CreatorApp {
    constructor() {
        this.creatorCanvas = document.getElementById('creator-canvas');
        this.gridCanvas = document.getElementById('gravity-grid-canvas');
        this.gridCtx = this.gridCanvas.getContext('2d');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.creatorCanvas, antialias: true, alpha: true });
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.gridSpacing = 30;
        this.helvetikerFont = null;
        this.init();
    }

    init() {
        this.scene.background = null;
        this.camera.position.set(0, 2, 8);
        
        // --- Professional Lighting Setup ---
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1.5);
        this.scene.add(hemiLight);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
        keyLight.position.set(-10, 8, 5);
        this.scene.add(keyLight);

        // --- Controls Setup and Bug Fixes ---
        this.scene.add(this.transformControls);
        
        // FIX: Prevent conflict between camera controls and object controls
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.orbitControls.enabled = !event.value;
        });

        // FIX: Prevent browser's default right-click menu from interfering
        this.renderer.domElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });

        // --- Initial Content and Listeners ---
        this.addSampleObject();
        this.attachEventListeners();

        const parentElement = this.renderer.domElement.parentElement;
        if (parentElement) {
            this.resize(parentElement.clientWidth, parentElement.clientHeight);
        }
        this.animate();
    }

    addSampleObject() {
        const material = new THREE.MeshStandardMaterial({ color: 0x2A2A3A, roughness: 0.5 });
        const geometry = new THREE.TorusKnotGeometry(0.8, 0.25, 128, 16);
        const object = new THREE.Mesh(geometry, material);
        this.scene.add(object);
        this.transformControls.attach(object);
    }

    attachEventListeners() {
        const fontLoader = new FontLoader();
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.helvetikerFont = font;
        });

        document.getElementById('text-button').addEventListener('click', () => this.generateText());
        document.getElementById('add-sphere').addEventListener('click', () => this.addPrimitive(new THREE.SphereGeometry(0.8, 32, 16)));
        document.getElementById('add-cube').addEventListener('click', () => this.addPrimitive(new THREE.BoxGeometry(1.2, 1.2, 1.2)));
        document.getElementById('add-torus').addEventListener('click', () => this.addPrimitive(new THREE.TorusGeometry(0.8, 0.3, 16, 100)));

        const toolsToggle = document.getElementById('tools-toggle');
        const modStackToggle = document.getElementById('mod-stack-toggle');
        const panels = document.querySelectorAll('.creator-panel');
        if (panels.length >= 2 && toolsToggle && modStackToggle) {
            const leftPanel = panels[0];
            const rightPanel = panels[1];
            
            leftPanel.classList.add('mobile-panel');
            rightPanel.classList.add('mobile-panel');

            toolsToggle.addEventListener('click', () => {
                leftPanel.classList.toggle('is-open');
                rightPanel.classList.remove('is-open');
            });
            modStackToggle.addEventListener('click', () => {
                rightPanel.classList.toggle('is-open');
                leftPanel.classList.remove('is-open');
            });
        }
    }

    generateText() {
        const textInput = document.getElementById('text-input');
        if (!this.helvetikerFont || !textInput.value) return;
        const geo = new TextGeometry(textInput.value, {font: this.helvetikerFont, size: 1.2, height: 0.2, curveSegments: 12});
        geo.center();
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color: 0x2A2A3A}));
        this.scene.add(mesh);
        this.transformControls.attach(mesh);
    }
    
    addPrimitive(geometry) {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x555555}));
        this.scene.add(mesh);
        this.transformControls.attach(mesh);
    }

    resize(width, height) {
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.gridCanvas.width = width;
        this.gridCanvas.height = height;
    }

    drawGravityGrid() {
        if (!this.gridCanvas.width) return;
        const ctx = this.gridCtx;
        ctx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
        ctx.strokeStyle = '#EFEFEF';
        ctx.lineWidth = 1;

        const objectsInScene = this.scene.children.filter(c => c.isMesh);
        const warpEllipses = objectsInScene.map(obj => {
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            const box = obj.geometry.boundingBox;
            const corners = [
                new THREE.Vector3(box.min.x, box.min.y, box.min.z), new THREE.Vector3(box.min.x, box.min.y, box.max.z),
                new THREE.Vector3(box.min.x, box.max.y, box.min.z), new THREE.Vector3(box.min.x, box.max.y, box.max.z),
                new THREE.Vector3(box.max.x, box.min.y, box.min.z), new THREE.Vector3(box.max.x, box.min.y, box.max.z),
                new THREE.Vector3(box.max.x, box.max.y, box.min.z), new THREE.Vector3(box.max.x, box.max.y, box.max.z),
            ];
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            corners.forEach(corner => {
                const screenPos = corner.clone().applyMatrix4(obj.matrixWorld).project(this.camera);
                const x = (screenPos.x * 0.5 + 0.5) * this.gridCanvas.width;
                const y = (-screenPos.y * 0.5 + 0.5) * this.gridCanvas.height;
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            });
            return { x: (minX + maxX) / 2, y: (minY + maxY) / 2, radiusX: (maxX - minX) / 2 + 50, radiusY: (maxY - minY) / 2 + 50 };
        });

        const getDisplacement = (x, y) => {
            let displacement = { x: 0, y: 0 };
            warpEllipses.forEach(ellipse => {
                const dx = (x - ellipse.x) / ellipse.radiusX;
                const dy = (y - ellipse.y) / ellipse.radiusY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 1 && dist > 0) {
                    const angle = Math.atan2(y - ellipse.y, x - ellipse.x);
                    const force = (1 - dist) * 40;
                    displacement.x += Math.cos(angle) * force;
                    displacement.y += Math.sin(angle) * force;
                }
            });
            return displacement;
        };

        const cols = Math.floor(this.gridCanvas.width / this.gridSpacing);
        const rows = Math.floor(this.gridCanvas.height / this.gridSpacing);

        for (let i = 0; i <= cols; i++) {
            ctx.beginPath();
            for (let j = 0; j <= rows; j++) {
                const x = i * this.gridSpacing; const y = j * this.gridSpacing;
                const disp = getDisplacement(x, y);
                if (j === 0) ctx.moveTo(x + disp.x, y + disp.y);
                else ctx.lineTo(x + disp.x, y + disp.y);
            }
            ctx.stroke();
        }
        for (let i = 0; i <= rows; i++) {
            ctx.beginPath();
            for (let j = 0; j <= cols; j++) {
                const x = j * this.gridSpacing; const y = i * this.gridSpacing;
                const disp = getDisplacement(x, y);
                if (j === 0) ctx.moveTo(x + disp.x, y + disp.y);
                else ctx.lineTo(x + disp.x, y + disp.y);
            }
            ctx.stroke();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const parent = this.renderer.domElement.parentElement;
        if (parent) {
            const { clientWidth, clientHeight } = parent;
            if (this.renderer.domElement.width !== clientWidth || this.renderer.domElement.height !== clientHeight) {
                this.resize(clientWidth, clientHeight);
            }
        }
        this.orbitControls.update();
        this.drawGravityGrid();
        this.renderer.render(this.scene, this.camera);
    }
}

new CreatorApp();