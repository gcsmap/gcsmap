// Import from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// === SCENE SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6f0ff);
scene.fog = new THREE.Fog(0xe6f0ff, 30, 100);

// === CAMERA ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const viewDistance = 20;
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
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// === GRID & GROUND ===
const tileSize = 1;
const gridSize = 10;

const grid = new THREE.GridHelper(gridSize, gridSize, 0x999999, 0xcccccc);
grid.position.y = -0.5;
scene.add(grid);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.ShadowMaterial({ opacity: 0.2 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

// === TOOLTIP ===
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.padding = '6px 12px';
tooltip.style.background = 'rgba(0,0,0,0.6)';
tooltip.style.color = 'white';
tooltip.style.borderRadius = '5px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
tooltip.style.zIndex = '1';
document.body.appendChild(tooltip);

// === CUBES ===
const cubeMaterial = new THREE.MeshStandardMaterial({
  color: 0xd3d3d3,
  transparent: true,
  opacity: 0.6
});

const cubes = [];

const positions = [
  [0, 0, 0],  // 1.A.1
  [1, 0, 0],  // 2.A.1
  [2, 0, 0]   // 3.A.1
];

positions.forEach(([x, y, z]) => {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(tileSize, tileSize, tileSize),
    cubeMaterial
  );
  cube.castShadow = true;
  cube.receiveShadow = true;

  const px = x * tileSize + tileSize / 2 - gridSize / 2;
  const py = tileSize / 2;
  const pz = z * tileSize + tileSize / 2 - gridSize / 2;

  cube.position.set(px, py, pz);

  cube.userData.coordinate = `${x + 1}.${String.fromCharCode(65 + y)}.${z + 1}`;
  cubes.push(cube);
  scene.add(cube);
});

// === HOVER COORDINATE DISPLAY ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length > 0) {
    const cube = intersects[0].object;
    tooltip.textContent = cube.userData.coordinate;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
  } else {
    tooltip.style.display = 'none';
  }
});

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

// Reset View Button
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

// Fullscreen Toggle
createUIButton('🖥️ Fullscreen', () => {
  if (!document.fullscreenElement) {
    document.body.requestFullscreen().catch(err =>
      alert(`Error: ${err.message}`)
    );
  } else {
    document.exitFullscreen();
  }
}, '60px');

// === RENDER LOOP ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
