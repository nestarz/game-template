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
      const toAdd = diff(objects, currentObjects);
      const toRemove = diff(currentObjects, objects);
      toAdd.forEach((object) => scene.add(object));
      toRemove.forEach((object) => scene.remove(object));
      currentObjects = objects;
      //console.clear();
      //currentObjects.map(object => object.__group__name === "DebugLine" && console.log(object.geometry));
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
