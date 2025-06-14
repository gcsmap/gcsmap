// Import from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';

// Scene and background
const scene = new THREE.Scene();
scene.background = new THREE.Color("white");

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Set initial position to 45° from top and 45° from left
const radius = 5;
const initialCameraPosition = new THREE.Vector3(
  radius * Math.sin(Math.PI / 4), // x
  radius * Math.sin(Math.PI / 4), // y
  radius * Math.cos(Math.PI / 4)  // z
);
camera.position.copy(initialCameraPosition);

// Target the center of the scene
const initialTarget = new THREE.Vector3(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grey cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: "grey" });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;
controls.target.copy(initialTarget);
controls.update();

// Handle resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ✅ Add Reset Button (styled with transparency)
const button = document.createElement('button');
button.textContent = "Reset View";
button.style.position = "absolute";
button.style.top = "20px";
button.style.left = "50%";
button.style.transform = "translateX(-50%)";
button.style.padding = "10px 20px";
button.style.background = "rgba(0, 0, 0, 0.3)";
button.style.color = "white";
button.style.border = "1px solid white";
button.style.borderRadius = "8px";
button.style.cursor = "pointer";
button.style.zIndex = "1";
button.style.backdropFilter = "blur(5px)";
document.body.appendChild(button);

// ✅ Reset camera and controls on button click
button.addEventListener('click', () => {
  camera.position.copy(initialCameraPosition);
  controls.target.copy(initialTarget);
  controls.update();
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
