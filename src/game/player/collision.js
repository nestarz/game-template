import * as THREE from "three";

export default ({ origin, direction, radius, objects } = {}) => {
  let distance = +Infinity;
  const raycaster = new THREE.Raycaster(origin, direction, 0, radius);
  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length !== 0 && intersects[0].distance < distance) {
    distance = intersects[0].distance;
  }

  return distance;
};
