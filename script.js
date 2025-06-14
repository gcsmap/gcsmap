// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("white"); // Set background to white

// Create the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add geometry and material for the cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: "grey" }); // Grey cube
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// === Add OrbitControls ===
// You must include this script in your HTML file:
// <script type="module">
//   import * as THREE from 'https://unpkg.com/three/build/three.module.js';
//   import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
// </script>

import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth motion
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;

// Animation loop (no cube rotation)
const animate = () => {
  requestAnimationFrame(animate);
  controls.update(); // required for damping
  renderer.render(scene, camera);
};

animate();
