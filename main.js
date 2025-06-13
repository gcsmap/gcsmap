// ✅ Use full CDN imports — not 'three'
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { ObjectLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 2, 5);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// ✅ Load scene.json properly
fetch('scene.json')
  .then(res => res.json())
  .then(json => {
    const loader = new ObjectLoader();
    const loadedScene = loader.parse(json.scene);
    scene.add(loadedScene);

    const box = loadedScene.getObjectByName("Box");
    if (box) {
      const helper = new THREE.BoxHelper(box, 0xff0000);
      scene.add(helper);
    } else {
      console.warn("Box not found in loaded scene.");
    }
  })
  .catch(err => {
    console.error("Error loading scene.json:", err);
  });

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
