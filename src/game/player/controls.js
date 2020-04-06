import * as THREE from "three";

export default ({
  moveforward,
  movebackward,
  moveleft,
  moveright,
  jump,
  rotateleft,
  rotateright,
}) => {
  const direction = new THREE.Vector3();
  const rotation = new THREE.Vector3();
  const actions = {
    KeyW: (x) => moveforward && direction.setX(x),
    KeyS: (x) => movebackward && direction.setX(-x),
    KeyA: (x) => {
      moveleft && direction.setZ(-x);
      rotateleft && rotation.setZ(-x);
    },
    KeyD: (x) => {
      moveright && direction.setZ(x);
      rotateright && rotation.setZ(x);
    },
    Space: (x) => jump && direction.setY(x),
  };

  return {
    direction,
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

      const directionObject = directionWorld
        .clone()
        .applyMatrix4(transform)
        .normalize();

      const result = new THREE.Vector3().set(
        directionObject.x,
        directionWorld.y,
        directionObject.z
      );
      result.phi = rotation.z;
      return result;
    },
  };
};
