import * as THREE from "three";

const diff = (a, b) => new Set([...a].filter((x) => !new Set(b).has(x)));

const resize = (camera, renderer) => {
  const canvas = renderer.domElement;
  if (!canvas.parentNode) return;
  const { width, height } = canvas.parentNode.getBoundingClientRect();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

export default ({ camera, renderer }) => {
  const scene = new THREE.Scene();

  let currentObjects = [];
  return {
    scene,
    updateObjects: (objects) => {
      const add = diff(objects, currentObjects);
      const remove = diff(currentObjects, objects);
      add.forEach((object) => scene.add(object));
      remove.forEach((object) => scene.remove(object));
      currentObjects = objects;
    },
    manager: {
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
