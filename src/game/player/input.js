import * as THREE from "three";

export default (
  moveforward = true,
  movebackward = true,
  moveleft = false,
  moveright = false,
  jump = true,
  rotateleft = true,
  rotateright = true
) => {
  const direction = new THREE.Vector3();
  const rotation = new THREE.Vector3();
  const actions = {
    KeyW: (x) => moveforward && direction.setZ(x),
    KeyS: (x) => movebackward && direction.setZ(-x),
    KeyA: (x) => {
      moveleft && direction.setX(-x);
      rotateleft && rotation.setX(-x);
    },
    KeyD: (x) => {
      moveright && direction.setX(x);
      rotateright && rotation.setX(x);
    },
    Space: (x) => jump && direction.setY(x),
  };

  return {
    get rotation() {
      return rotation.clone();
    },
    get direction() {
      return direction.clone();
    },
    trigger: (code) => actions[code] && actions[code](1),
    release: (code) => actions[code] && actions[code](0),
    reset: () => direction.set(0, 0, 0),
    fromTransformMatrix: (position, quaternion) => {
      const transform = new THREE.Matrix4();
      transform.compose(
        new THREE.Vector3().copy(position),
        new THREE.Quaternion().copy(quaternion),
        new THREE.Vector3(1, 1, 1)
      );

      const directionWorld = new THREE.Vector4(
        direction.x,
        direction.y,
        direction.z,
        0
      );

      const directionObject4 = directionWorld
        .clone()
        .applyMatrix4(transform)
        .normalize();

      const directionObject = new THREE.Vector3().set(
        directionObject4.x,
        directionWorld.y,
        directionObject4.z
      );
      return directionObject;
    },
  };
};
