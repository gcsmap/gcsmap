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

// === REFLECTION PROBE ===
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
});
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
scene.add(cubeCamera);

// === GRID + GROUND ===
const gridHelper = new THREE.GridHelper(40, 40, 0xcccccc, 0xcccccc);
scene.add(gridHelper);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.ShadowMaterial({ opacity: 0.15 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// === BORDER ===
const borderGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-9, 0.01, -20),
  new THREE.Vector3(20, 0.01, -20),
  new THREE.Vector3(20, 0.01, 1),
  new THREE.Vector3(-9, 0.01, 1),
  new THREE.Vector3(-9, 0.01, -20),
]);
const borderLine = new THREE.Line(borderGeometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
scene.add(borderLine);

// === AXIS GUIDE ===
const basePos = new THREE.Vector3(-20, 0, -20);
const axisLength = 5;
scene.add(
  new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), basePos, axisLength, 0x00ff00),
  new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), basePos, axisLength, 0xff0000),
  new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), basePos, axisLength, 0x0000ff)
);

// === AXIS LABELS ===
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
  const createLabel = (text, color, pos) => {
    const textGeo = new TextGeometry(text, {
      font,
      size: 0.8,
      height: 0.1,
    });
    const textMat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(textGeo, textMat);
    mesh.position.copy(pos);
    scene.add(mesh);
  };
  createLabel('X', 0x00ff00, basePos.clone().add(new THREE.Vector3(axisLength + 0.5, 0, 0)));
  createLabel('Y', 0xff0000, basePos.clone().add(new THREE.Vector3(0, axisLength + 0.5, 0)));
  createLabel('Z', 0x0000ff, basePos.clone().add(new THREE.Vector3(0, 0, axisLength + 0.5)));
});

// === CUBES WITH GLASS & GLOW ===
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const zValues = [-20, -18, -16, -14, -12, -10, -8, -6, -4, -2];

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0,
  metalness: 0,
  transmission: 1,
  ior: 1.52,
  thickness: 1,
  envMap: cubeRenderTarget.texture,
  envMapIntensity: 1.5,
  clearcoat: 1,
  clearcoatRoughness: 0,
  transparent: true,
  opacity: 1,
});

const glowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.2,
});
const glowCubes = [];

zValues.forEach(z => {
  const cube = new THREE.Mesh(cubeGeometry, glassMaterial);
  cube.position.set(-8, 1, z);
  cube.castShadow = true;
  scene.add(cube);

  const glowShell = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), glowMaterial);
  glowShell.position.copy(cube.position);
  scene.add(glowShell);
  glowCubes.push(glowShell);
});

// === RESET VIEW BUTTON ===
const resetButton = document.createElement('button');
resetButton.textContent = '🔄 Reset View';
Object.assign(resetButton.style, {
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '10px 20px',
  background: 'rgba(0, 0, 0, 0.3)',
  color: 'white',
  border: '1px solid white',
  borderRadius: '8px',
  cursor: 'pointer',
  zIndex: '1',
  backdropFilter: 'blur(5px)',
});
document.body.appendChild(resetButton);

resetButton.addEventListener('click', () => {
  gsap.to(camera.position, {
    duration: 1.2,
    x: 0,
    y: Math.sin(angleRad) * radius,
    z: Math.cos(angleRad) * radius,
    onUpdate: () => controls.update(),
  });
  gsap.to(controls.target, {
    duration: 1.2,
    x: 0,
    y: 0,
    z: 0,
    onUpdate: () => controls.update(),
  });
});

// === RESIZE HANDLER ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === ANIMATE ===
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.05;
  const pulse = (Math.sin(t) + 1) * 0.1 + 0.2;
  glowCubes.forEach(cube => cube.material.opacity = pulse);

  cubeCamera.update(renderer, scene); // update reflection
  controls.update();
  renderer.render(scene, camera);
}
animate();
