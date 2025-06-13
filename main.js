import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { ObjectLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Set up renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up scene and camera
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 2, 5);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Ambient light
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// Load scene.json manually
const loader = new ObjectLoader();

fetch('scene.json')
  .then(response => response.json())
  .then(json => {
    const loadedScene = loader.parse(json.scene); // assuming your scene is under the `scene` key
    scene.add(loadedScene);

    // Optional helper to show the box outline
    const box = loadedScene.getObjectByName("Box");
    if (box) {
      const helper = new THREE.BoxHelper(box, 0xff0000);
      scene.add(helper);
    } else {
      console.warn("Box not found in loaded scene.");
    }
  })
  .catch(error => {
    console.error("Error loading scene.json:", error);
  });

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
