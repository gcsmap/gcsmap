// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("white"); // 2. Set background to white

// Create the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add geometry and material for the cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: "grey" }); // 1. Grey cube
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 3. Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Position the camera
camera.position.z = 5;

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
};

animate();
