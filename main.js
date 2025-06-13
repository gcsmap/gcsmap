import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// Basic renderer, scene, camera
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 2, 5);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);

// Add light in case something fails with imported light
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

import { ObjectLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const loader = new ObjectLoader();

loader.load(
  'scene.json',
  (loadedScene) => {
    console.log('Scene loaded:', loadedScene);
    scene.add(loadedScene);

    // OPTIONAL: Visual debug box to ensure mesh exists
    const box = loadedScene.getObjectByName("Box");
    if (box) {
      const helper = new THREE.BoxHelper(box, 0xff0000);
      scene.add(helper);
    } else {
      console.warn("Box not found in loaded scene.");
    }
  },
  undefined,
  (err) => {
    console.error('Failed to load scene.json:', err);
  }
);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
