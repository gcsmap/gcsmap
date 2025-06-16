// Import from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// === SCENE SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6f0ff);
scene.fog = new THREE.Fog(0xe6f0ff, 30, 200);

// === CAMERA ===
const tileSize = 1;
const gridSize = 40;
const gridWidth = gridSize * tileSize;

const aspect = window.innerWidth / window.innerHeight;
const fov = 75;
const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);

// Fit camera to full grid width
const fitWidthDistance = (gridWidth / 2) / Math.tan((fov / 2) * Math.PI / 180);
camera.position.set(0, fitWidthDistance * 0.8, fitWidthDistance);
camera.lookAt(0, 0, 0);

const initialCameraPosition = camera.position.clone();
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

// === GRID ===
const grid = new THREE.GridHelper(gridSize, gridSize, 0xcccccc, 0xcccccc);
grid.position.y = 0;
scene.add(grid);

// === GROUND ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(gridSize * 10, gridSize * 10),
  new THREE.ShadowMaterial({ opacity: 0.2 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// === RECTANGLE OUTLINE (29 × 21) at Top-Right ===
const rectCols = 29;
const rectRows = 21;

const startX = (gridSize / 2 - rectCols) * tileSize;
const startZ = -(gridSize / 2) * tileSize;

const rectPoints = [
  new THREE.Vector3(startX, 0.001, startZ),
  new THREE.Vector3(startX + rectCols, 0.001, startZ),
  new THREE.Vector3(startX + rectCols, 0.001, startZ + rectRows),
  new THREE.Vector3(startX, 0.001, startZ + rectRows),
  new THREE.Vector3(startX, 0.001, startZ)
];

const rectGeometry = new THREE.BufferGeometry().setFromPoints(rectPoints);
const rectMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const rectangle = new THREE.Line(rectGeometry, rectMaterial);
scene.add(rectangle);

// === SINGLE CUBE ===
const cubeSize = 2;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeMaterial = new THREE.MeshStandardMaterial({
  color: 0xd3d3d3,
  transparent: true,
  opacity: 0.6
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, cubeSize / 2, 0);
cube.castShadow = false;
cube.receiveShadow = false;
cube.userData.coordinate = `1.A.1`;
scene.add(cube);

// === TOOLTIP FOR COORDINATES ===
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.padding = '6px 12px';
tooltip.style.background = 'rgba(0,0,0,0.6)';
tooltip.style.color = 'white';
tooltip.style.borderRadius = '5px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
tooltip.style.zIndex = '10';
document.body.appendChild(tooltip);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const cubes = [cube];

function updateTooltip(event) {
  const x = (event.clientX || event.touches?.[0]?.clientX) / window.innerWidth * 2 - 1;
  const y = -(event.clientY || event.touches?.[0]?.clientY) / window.innerHeight * 2 + 1;
  mouse.set(x, y);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    tooltip.textContent = intersected.userData.coordinate;
    tooltip.style.display = 'block';
    tooltip.style.left = `${(event.clientX || event.touches?.[0]?.clientX) + 10}px`;
    tooltip.style.top = `${(event.clientY || event.touches?.[0]?.clientY) + 10}px`;
  } else {
    tooltip.style.display = 'none';
  }
}

window.addEventListener('pointermove', updateTooltip);
window.addEventListener('touchstart', updateTooltip);

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
