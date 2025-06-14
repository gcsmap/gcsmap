// BASIC SETUP
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 4;

var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setClearColor("#000000");
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// Create a Cube
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: "#433F81" });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Load font and add label
var loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
  var textGeometry = new THREE.TextGeometry('A107', {
    font: font,
    size: 0.2,
    height: 0.01
  });
  var textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var textMesh = new THREE.Mesh(textGeometry, textMaterial);

  // Position the text slightly in front of the cube's front face
  textMesh.position.set(-0.3, -0.1, 0.51);
  cube.add(textMesh); // attach text to cube so it rotates with it
});

// RENDER LOOP
var render = function () {
  requestAnimationFrame(render);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
};

render();
