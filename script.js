// Import from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color("white");

// Camera setup (zoomed out, ~20 cubes visible)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const viewDistance = 20; // Increased view distance
const initialCameraPosition = new THREE.Vector3(
  viewDistance * Math.sin(Math.PI / 4),
  viewDistance * Math.sin(Math.PI / 4),
  viewDistance * Math.cos(Math.PI / 4)
);
camera.position.copy(initialCameraPosition);
const initialTarget = new THREE.Vector3(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;
controls.target.copy(initialTarget);
controls.update();

// Restrict orbit below geometry
controls.minPolarAngle = 0;                    // Top view
controls.maxPolarAngle = Math.PI / 2;          // Limit to horizontal

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Cube - light grey with transparency
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({
    color: 0xd3d3d3,         // light grey
    transparent: true,
    opacity: 0.6
  })
);
scene.add(cube);

// Extra shapes
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 'skyblue' })
);
sphere.position.set(-3, 0, 0);
scene.add(sphere);

const cone = new THREE.Mesh(
  new THREE.ConeGeometry(0.5, 1, 32),
  new THREE.MeshStandardMaterial({ color: 'orange' })
);
cone.position.set(3, 0, 0);
scene.add(cone);

// Create transparent UI buttons
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

// Reset View Button (smooth animation)
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

// Fullscreen Toggle Button
createUIButton('🖥️ Fullscreen', () => {
  if (!document.fullscreenElement) {
    document.body.requestFullscreen().catch(err =>
      alert(`Error attempting to enable fullscreen: ${err.message}`)
    );
  } else {
    document.exitFullscreen();
  }
}, '60px');

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
