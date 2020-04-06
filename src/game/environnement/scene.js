import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const diff = (a, b) => new Set([...a].filter((x) => !new Set(b).has(x)));

const setupControls = (camera, renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.applyQuaternion(camera.quaternion);
  controls.update();
  return controls;
};

const resize = (camera, renderer) => {
  const canvas = renderer.domElement;
  if (!canvas.parentNode) return;
  const { width, height } = canvas.parentNode.getBoundingClientRect();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

export default (options = { withControls: true }) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
  const renderer = new THREE.WebGLRenderer();

  renderer.setPixelRatio(window.devicePixelRatio / 1);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, 0);

  const controls = options.withControls
    ? setupControls(camera, renderer)
    : null;

  let currentObjects = [];
  return {
    scene,
    camera,
    renderer,
    controls,
    updateObjects: (objects) => {
      const add = diff(objects, currentObjects);
      const remove = diff(currentObjects, objects);
      add.forEach((object) => scene.add(object));
      remove.forEach((object) => scene.remove(object));
      currentObjects = objects;
    },
    manager: {
      objects: [new THREE.AxesHelper(50)],
      update: () => {},
      resize: () => resize(camera, renderer),
      start: () => {
        resize(camera, renderer);
        function animate() {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        }
        animate();
      },
    },
  };
};
