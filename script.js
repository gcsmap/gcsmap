import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.158.0/examples/jsm/geometries/TextGeometry.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('#000000');
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "#433F81" });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Load and attach text
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
  const textGeo = new TextGeometry("A107", {
    font: font,
    size: 0.2,
    height: 0.01
  });
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const textMesh = new THREE.Mesh(textGeo, textMaterial);
  textMesh.position.set(-0.3, -0.1, 0.51);
  cube.add(textMesh);
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}
animate();
