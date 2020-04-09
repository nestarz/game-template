import * as THREE from "three";

const temp0 = new THREE.Vector3();
const temp1 = new THREE.Vector3();
export default ({
  origin,
  direction,
  radius = +Infinity,
  near = 5,
  objects,
} = {}) => {
  let intersect = null;
  const raycaster = new THREE.Raycaster(
    temp0.copy(origin),
    temp1.copy(direction),
    near,
    radius
  );
  const intersects = raycaster.intersectObjects(objects);

  if (
    intersects.length !== 0 &&
    (!intersect || intersects[0].distance < intersect.distance)
  ) {
    intersect = intersects[0];
  }

  return intersect;
};
