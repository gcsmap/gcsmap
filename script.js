// Import necessary modules
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/geometries/TextGeometry.js';
import { Line2 } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/lines/LineGeometry.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6f0ff);
scene.fog = new THREE.Fog(0xe6f0ff, 50, 150);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const radius = 70;
const angleRad = THREE.MathUtils.degToRad(60);
camera.position.set(0, Math.sin(angleRad) * radius, Math.cos(angleRad) * radius);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(0, 0, 0);
controls.update();

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// Grid floor
scene.add(new THREE.GridHelper(40, 40, 0xcccccc, 0xcccccc));

// Border (29x21) at (-9, 0, -20)
const borderPoints = [
  [-9, 0.01, -20], [20, 0.01, -20],
  [20, 0.01, 1], [-9, 0.01, 1],
  [-9, 0.01, -20]
].map(p => new THREE.Vector3(...p));
const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
const borderMat = new THREE.LineBasicMaterial({ color: 0x000000 });
scene.add(new THREE.Line(borderGeo, borderMat));

// Axis Guide at (-20, 0, -20)
const axisBase = new THREE.Vector3(-20, 0, -20);
scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), axisBase, 5, 0x00ff00));
scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), axisBase, 5, 0xff0000));
scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), axisBase, 5, 0x0000ff));

// Axis Labels
new FontLoader().load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
  const makeLabel = (text, color, offset) => {
    const geometry = new TextGeometry(text, {
      font,
      size: 0.8,
      height: 0.1,
    });
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(axisBase.clone().add(offset));
    scene.add(mesh);
  };
  makeLabel('X', 0x00ff00, new THREE.Vector3(6, 0, 0));
  makeLabel('Y', 0xff0000, new THREE.Vector3(0, 6, 0));
  makeLabel('Z', 0x0000ff, new THREE.Vector3(0, 0, 6));
});

// Cube Data (20 total)
const cubePositions = [
  [-9, 0, 20], [-9, 0, 18], [-9, 0, 16], [-9, 0, 14], [-9, 0, 12],
  [-9, 0, 10], [-9, 0, 8], [-9, 0, 6], [-9, 0, 4], [-9, 0, 2],
  [-8, 0, -20], [-8, 0, -18], [-8, 0, -16], [-8, 0, -14], [-8, 0, -12],
  [-8, 0, -10], [-8, 0, -8], [-8, 0, -6], [-8, 0, -4], [-8, 0, -2]
];

// Cube settings
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshStandardMaterial({
  color: 0xd3d3d3,
  transparent: true,
  opacity: 0.6,
});

// FatLine for edges
cubePositions.forEach(([x, y, z]) => {
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(x, 1, z);
  scene.add(cube);

  const edges = new THREE.EdgesGeometry(cubeGeometry);
  const edgePositions = edges.attributes.position.array;

  const lineGeometry = new LineGeometry();
  lineGeometry.setPositions(edgePositions);

  const lineMaterial = new LineMaterial({
    color: 0xffffff,
    linewidth: 0.03, // Thicker line
    worldUnits: true,
    transparent: true,
    opacity: 0.8,
  });

  const line = new Line2(lineGeometry, lineMaterial);
  line.computeLineDistances();
  line.scale.copy(cube.scale);
  line.position.copy(cube.position);
  scene.add(line);
});

// Reset Camera Button
const resetBtn = document.createElement('button');
resetBtn.textContent = '🔄 Reset View';
Object.assign(resetBtn.style, {
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '10px 20px',
  background: 'rgba(0,0,0,0.3)',
  color: 'white',
  border: '1px solid white',
  borderRadius: '8px',
  cursor: 'pointer',
  zIndex: 1,
  backdropFilter: 'blur(5px)'
});
resetBtn.onclick = () => {
  gsap.to(camera.position, {
    duration: 1.2,
    x: 0,
    y: Math.sin(angleRad) * radius,
    z: Math.cos(angleRad) * radius,
    onUpdate: () => controls.update()
  });
  gsap.to(controls.target, {
    duration: 1.2,
    x: 0, y: 0, z: 0,
    onUpdate: () => controls.update()
  });
};
document.body.appendChild(resetBtn);

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
