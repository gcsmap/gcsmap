import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Box
const geometry = new THREE.BoxGeometry(2, 1, 1);
const material = new THREE.MeshNormalMaterial({ wireframe: false });
const box = new THREE.Mesh(geometry, material);
scene.add(box);

// Text Label
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new THREE.TextGeometry('A107', {
        font: font,
        size: 0.3,
        height: 0.05,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(-0.6, 0.6, 0.51); // front face of the box
    scene.add(text);
});

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
