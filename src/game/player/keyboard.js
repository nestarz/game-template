import * as THREE from "three";

export default (camera) => {
  const direction = new THREE.Vector3();
  const norm = new THREE.Vector3();
  const vec3 = new THREE.Vector3();
  const save = {
    z: new THREE.Vector3(),
    s: new THREE.Vector3(),
    q: new THREE.Vector3(),
    d: new THREE.Vector3(),
    " ": new THREE.Vector3(),
  };
  const remove = (key) => {
    if (save[key]) {
      vec3.sub(save[key]);
      save[key].set(0, 0, 0);
    }
  };
  const add = (key) => {
    camera.getWorldDirection(direction);
    norm.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
    const actions = {
      z: () => save.z.set(direction.x, 0, direction.z),
      s: () => save.s.set(-direction.x, 0, -direction.z),
      q: () => save.q.set(-norm.x, 0, -norm.z),
      d: () => save.d.set(norm.x, 0, norm.z),
      " ": () => save[" "].set(0, 0.1, 0),
    };
    const action = actions[key];
    if (action) action();
    vec3.set(0, 0, 0);
    Object.values(save).forEach((vec) => vec3.add(vec));
  };

  return { get: () => vec3.clone(), add, remove };
};
