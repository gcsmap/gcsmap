// Import from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// === SCENE SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6f0ff); // light blue
scene.fog = new THREE.Fog(0xe6f0ff, 20, 50);   // fog

// === CAMERA ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
document.body.appendChild(renderer.domElement);

// === CONTROLS ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2; // prevent going under ground
controls.target.copy(initialTarget);
controls.update();

// === LIGHTS ===
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// === GRID GROUND ===
const grid = new THREE.GridHelper(50, 50);
scene.add(grid);

// === GROUND RECEIVER ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.ShadowMaterial({ opacity: 0.15 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// === MATERIAL ===
const cubeMaterial = new THREE.MeshStandardMaterial({
  color: 0xd3d3d3,
  transparent: true,
  opacity: 0.6
});

// === SNAP TO TILE CENTER ===
function snapToTileCenter(n) {
  return Math.floor(n) + 0.5;
}

// === CUBE CREATION ===
const cubes = [];

function createCubeAtTile(x, z) {
  const cube = new THREE.Mesh(new THREE.BoxGeometry(), cubeMaterial);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.position.set(
    snapToTileCenter(x),
    0.5,
    snapToTileCenter(z)
  );
  cubes.push(cube);
  scene.add(cube);
}

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

// === COORDINATE TOOLTIP ===
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.padding = '6px 12px';
tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
tooltip.style.color = 'white';
tooltip.style.borderRadius = '4px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
tooltip.style.fontSize = '14px';
tooltip.style.zIndex = '10';
document.body.appendChild(tooltip);

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(cubes);
  if (intersects.length > 0) {
    const pos = intersects[0].object.position;
    tooltip.textContent = `X: ${pos.x.toFixed(1)}, Y: ${pos.y.toFixed(1)}, Z: ${pos.z.toFixed(1)}`;
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }
}

function onPointerTap(event) {
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const y = event.touches ? event.touches[0].clientY : event.clientY;
  pointer.x = (x / window.innerWidth) * 2 - 1;
  pointer.y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(cubes);
  if (intersects.length > 0) {
    const pos = intersects[0].object.position;
    tooltip.textContent = `X: ${pos.x.toFixed(1)}, Y: ${pos.y.toFixed(1)}, Z: ${pos.z.toFixed(1)}`;
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y + 10}px`;
    tooltip.style.display = 'block';
    setTimeout(() => tooltip.style.display = 'none', 1500);
  }
}

window.addEventListener('mousemove', onPointerMove);
window.addEventListener('touchstart', onPointerTap);

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
