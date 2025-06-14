// Import from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// === SCENE SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6f0ff); // light blue
scene.fog = new THREE.Fog(0xe6f0ff, 20, 50);

// === CAMERA ===
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
const viewDistance = 30;
const initialCameraPosition = new THREE.Vector3(
  viewDistance * Math.sin(Math.PI / 4),
  viewDistance * Math.sin(Math.PI / 4),
  viewDistance * Math.cos(Math.PI / 4)
);
camera.position.copy(initialCameraPosition);
const initialTarget = new THREE.Vector3(0, 0, 0);

// === RENDERER ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// === CONTROLS ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.target.copy(initialTarget);
controls.update();

// === LIGHTS ===
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
scene.add(directionalLight);

// === SHADOW RECEIVING GROUND PLANE ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.ShadowMaterial({ opacity: 0.2 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// === HELPER GRID ON TOP OF GROUND ===
const grid = new THREE.GridHelper(50, 50);
grid.material.opacity = 0.4;
grid.material.transparent = true;
scene.add(grid);

// === SHARED MATERIAL FOR CUBES ===
const cubeMaterial = new THREE.MeshStandardMaterial({
  color: 0xd3d3d3,
  transparent: true,
  opacity: 0.6
});

// === SNAP TO TILE CENTER ===
function snapToTileCenter(value, gridUnit = 1) {
  return Math.floor(value / gridUnit) * gridUnit + gridUnit / 2;
}

// === CREATE CUBE AT TILE CENTER ===
function createCubeAtTile(x, z) {
  const cube = new THREE.Mesh(new THREE.BoxGeometry(), cubeMaterial);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.position.set(
    snapToTileCenter(x),
    0.5,
    snapToTileCenter(z)
  );
  scene.add(cube);
}

// === PLACE SOME CUBES ===
createCubeAtTile(0, 0);
createCubeAtTile(1, 1);
createCubeAtTile(-3, 2);
createCubeAtTile(4, -2);
createCubeAtTile(-5, -4);

// === UI BUTTONS ===
function createUIButton(text, onClick, topOffset) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.position = 'absolute';
  btn.style.top = topOffset;
  btn.style.left = '50%';
  btn.style.transform = 'translateX(-50%)';
  btn.style.padding = '10px 20px';
  btn.style.background = 'rgba(0, 0, 0, 0.3)';
  btn.style.color = 'white';
  btn.style.border = '1px solid white';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.style.zIndex = '1';
  btn.style.backdropFilter = 'blur(5px)';
  btn.addEventListener('click', onClick);
  document.body.appendChild(btn);
}

// Reset View
createUIButton('🔄 Reset View', () => {
  gsap.to(camera.position, {
    duration: 1.2,
    x: initialCameraPosition.x,
    y: initialCameraPosition.y,
    z: initialCameraPosition.z,
    onUpdate: () => controls.update()
  });
  gsap.to(controls.target, {
    duration: 1.2,
    x: initialTarget.x,
    y: initialTarget.y,
    z: initialTarget.z,
    onUpdate: () => controls.update()
  });
}, '20px');

// Fullscreen
createUIButton('🖥️ Fullscreen', () => {
  if (!document.fullscreenElement) {
    document.body.requestFullscreen().catch(err =>
      alert(`Error: ${err.message}`)
    );
  } else {
    document.exitFullscreen();
  }
}, '60px');

// === RESIZE HANDLER ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === ANIMATION LOOP ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
