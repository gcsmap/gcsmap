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
document.body.appendChild(renderer.domElement);

// === CONTROLS ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.maxPolarAngle = Math.PI / 2;
controls.update();

// === LIGHTS ===
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// === GRID ===
const gridHelper = new THREE.GridHelper(40, 40, 0xcccccc, 0xcccccc);
scene.add(gridHelper);

// === BORDER (29 x 21) at -9,0,-20 ===
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

// === AXIS GUIDE at (-20, 0, -20) ===
const axisLength = 5;
const basePos = new THREE.Vector3(-20, 0, -20);
const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), basePos, axisLength, 0x00ff00);
const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), basePos, axisLength, 0xff0000);
const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), basePos, axisLength, 0x0000ff);
scene.add(arrowX, arrowY, arrowZ);

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

// === CUBES at specified coordinates ===
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, transparent: true, opacity: 0.6 });
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const zValues = [-20, -18, -16, -14, -12, -10, -8, -6, -4, -2];

zValues.forEach(z => {
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(-8, 1, z);
  scene.add(cube);
});

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

// === RAYCASTING ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.isMesh && obj.geometry.type === 'BoxGeometry'));
  if (intersects.length > 0) {
    const pos = intersects[0].object.position;
    tooltip.innerHTML = `<span style="color:green">X:</span> ${pos.x - 1}<br><span style="color:red">Y:</span> ${pos.y - 1}<br><span style="color:blue">Z:</span> ${pos.z - 1}`;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
  } else {
    tooltip.style.display = 'none';
  }
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
