// Import from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/geometries/TextGeometry.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// === SCENE SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6f0ff);
scene.fog = new THREE.Fog(0xe6f0ff, 50, 150);

// === CAMERA ===
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const radius = 70;
const angleRad = THREE.MathUtils.degToRad(60);
camera.position.set(0, Math.sin(angleRad) * radius, Math.cos(angleRad) * radius);
camera.lookAt(0, 0, 0);

// === RENDERER ===
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// === CONTROLS ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.maxPolarAngle = Math.PI / 2;
controls.update();

// === LIGHTS ===
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// === ENV MAP for GLASS REFLECTION ===
const path = 'https://threejs.org/examples/textures/cube/Bridge2/';
const format = '.jpg';
const urls = [
  path + 'posx' + format, path + 'negx' + format,
  path + 'posy' + format, path + 'negy' + format,
  path + 'posz' + format, path + 'negz' + format
];
const envMap = new THREE.CubeTextureLoader().load(urls);
scene.environment = envMap;

// === PLANE (GROUND) ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.ShadowMaterial({ opacity: 0.1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// === GRID ===
const gridHelper = new THREE.GridHelper(40, 40, 0xcccccc, 0xcccccc);
scene.add(gridHelper);

// === BORDER (29 x 21) ===
const borderMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const borderGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-9, 0.01, -20),
  new THREE.Vector3(20, 0.01, -20),
  new THREE.Vector3(20, 0.01, 1),
  new THREE.Vector3(-9, 0.01, 1),
  new THREE.Vector3(-9, 0.01, -20),
]);
const borderLine = new THREE.Line(borderGeometry, borderMaterial);
scene.add(borderLine);

// === AXIS GUIDE ===
const axisLength = 5;
const basePos = new THREE.Vector3(-20, 0, -20);
scene.add(
  new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), basePos, axisLength, 0x00ff00),
  new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), basePos, axisLength, 0xff0000),
  new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), basePos, axisLength, 0x0000ff)
);

// === AXIS LABELS ===
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
  const createLabel = (text, color, position) => {
    const geometry = new TextGeometry(text, {
      font: font,
      size: 0.8,
      height: 0.1,
    });
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    scene.add(mesh);
  };

  createLabel('X', 0x00ff00, basePos.clone().add(new THREE.Vector3(axisLength + 0.5, 0, 0)));
  createLabel('Y', 0xff0000, basePos.clone().add(new THREE.Vector3(0, axisLength + 0.5, 0)));
  createLabel('Z', 0x0000ff, basePos.clone().add(new THREE.Vector3(0, 0, axisLength + 0.5)));
});

// === GLASS & GLOWING CUBES (with spacing) ===
const cubeSize = 2;
const spacing = 2.1;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xbbbbbb,
  roughness: 0,
  transmission: 1,
  thickness: 0.5,
  metalness: 0,
  ior: 1.5,
  envMap: envMap,
  envMapIntensity: 1.2,
  transparent: true
});

const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  emissive: 0x88ccff,
  transparent: true,
  opacity: 0.15
});

// Fixed positions 
const cubePositions = [
  { x: -8, y: 1, z: -19 },
  { x: -8, y: 1, z: -17 },
  { x: -8, y: 1, z: -15 },
  { x: -8, y: 1, z: -13 },
  { x: -8, y: 1, z: -11 },
  { x: -8, y: 1, z: -9 },
  { x: -8, y: 1, z: -7 },
  { x: -8, y: 1, z: -5 },
  { x: -8, y: 1, z: -3 },
  { x: -8, y: 1, z: -1 }
];

cubePositions.forEach(pos => {
  const cube = new THREE.Mesh(cubeGeometry, glassMaterial);
  cube.position.set(pos.x, pos.y, pos.z);
  cube.castShadow = true;
  scene.add(cube);

  const glow = new THREE.Mesh(new THREE.BoxGeometry(cubeSize + 0.2, cubeSize + 0.2, cubeSize + 0.2), glowMaterial);
  glow.position.copy(cube.position);
  scene.add(glow);
});

// === RESET VIEW BUTTON ===
const resetButton = document.createElement('button');
resetButton.textContent = '🔄 Reset View';
resetButton.style.position = 'absolute';
resetButton.style.top = '20px';
resetButton.style.left = '50%';
resetButton.style.transform = 'translateX(-50%)';
resetButton.style.padding = '10px 20px';
resetButton.style.background = 'rgba(0, 0, 0, 0.3)';
resetButton.style.color = 'white';
resetButton.style.border = '1px solid white';
resetButton.style.borderRadius = '8px';
resetButton.style.cursor = 'pointer';
resetButton.style.zIndex = '1';
resetButton.style.backdropFilter = 'blur(5px)';
document.body.appendChild(resetButton);

resetButton.addEventListener('click', () => {
  gsap.to(camera.position, {
    duration: 1.2,
    x: 0,
    y: Math.sin(angleRad) * radius,
    z: Math.cos(angleRad) * radius,
    onUpdate: () => controls.update()
  });
  gsap.to(controls.target, {
    duration: 1.2,
    x: 0,
    y: 0,
    z: 0,
    onUpdate: () => controls.update()
  });
});

// === RESIZE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === ANIMATE ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
