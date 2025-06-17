// Import from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/geometries/TextGeometry.js';
import { Line2 } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/lines/LineGeometry.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe6f0ff);
scene.fog = new THREE.Fog(0xe6f0ff, 50, 150);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const radius = 70;
const angleRad = THREE.MathUtils.degToRad(60);
camera.position.set(0, Math.sin(angleRad) * radius, Math.cos(angleRad) * radius);
camera.lookAt(0, 0, 0);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);
controls.maxPolarAngle = Math.PI / 2;
controls.update();

// --- Light & Grid ---
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
scene.add(new THREE.GridHelper(40, 40, 0xcccccc, 0xcccccc));

// --- Border ---
const borderMat = new THREE.LineBasicMaterial({ color: 0x000000 });
const borderGeo = new THREE.BufferGeometry().setFromPoints([
  [-9, 0.01, -20], [20, 0.01, -20],
  [20, 0.01, 1], [-9, 0.01, 1],
  [-9, 0.01, -20]
].map(p => new THREE.Vector3(...p)));
scene.add(new THREE.Line(borderGeo, borderMat));

// --- Axis Guide ---
const axisBase = new THREE.Vector3(-20, 0, -20);
scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), axisBase, 5, 0x00ff00));
scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), axisBase, 5, 0xff0000));
scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), axisBase, 5, 0x0000ff));

new FontLoader().load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
  const mk = (t, c, pos) => {
    const mesh = new THREE.Mesh(new TextGeometry(t, { font, size: 0.8, height: 0.1 }),
                                new THREE.MeshBasicMaterial({ color: c }));
    mesh.position.copy(pos); scene.add(mesh);
  };
  mk('X', 0x00ff00, axisBase.clone().add(new THREE.Vector3(5.5, 0, 0)));
  mk('Y', 0xff0000, axisBase.clone().add(new THREE.Vector3(0, 5.5, 0)));
  mk('Z', 0x0000ff, axisBase.clone().add(new THREE.Vector3(0, 0, 5.5)));
});

// --- Cubes with FatLine Edges ---
const cubeGeom = new THREE.BoxGeometry(2, 2, 2);
const cubeMat = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, transparent: true, opacity: 0.6 });
const zVals = [-20, -18, -16, -14, -12, -10, -8, -6, -4, -2];

zVals.forEach(z => {
  const cube = new THREE.Mesh(cubeGeom, cubeMat);
  cube.position.set(-8, 1, z);
  scene.add(cube);

  const edgePts = new THREE.EdgesGeometry(cubeGeom).attributes.position.array;
  const coords = Array.from(edgePts);
  const lgeo = new LineGeometry();
  lgeo.setPositions(coords);

  const lmat = new LineMaterial({
    color: 0xffffff,
    linewidth: 0.01, // high DPI, so small world units
    worldUnits: true,
    transparent: true,
    opacity: 0.5
  });

  const line = new Line2(lgeo, lmat);
  line.computeLineDistances();
  line.scale.copy(cube.scale);
  line.position.copy(cube.position);
  scene.add(line);
});

// --- Reset Button ---
const btn = document.createElement('button');
btn.textContent = '🔄 Reset View';
Object.assign(btn.style, {
  position: 'absolute', top: '20px',
  left: '50%', transform: 'translateX(-50%)',
  padding: '10px 20px', background: 'rgba(0,0,0,0.3)',
  color: 'white', border: '1px solid white',
  borderRadius: '8px', cursor: 'pointer', zIndex: 1,
  backdropFilter: 'blur(5px)'
});
btn.onclick = () => {
  gsap.to(camera.position, {
    duration: 1.2,
    x: 0, y: Math.sin(angleRad) * radius, z: Math.cos(angleRad) * radius,
    onUpdate: () => controls.update()
  });
  gsap.to(controls.target, {
    duration: 1.2,
    x: 0, y: 0, z: 0,
    onUpdate: () => controls.update()
  });
};
document.body.appendChild(btn);

// --- Resize & Animate ---
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
