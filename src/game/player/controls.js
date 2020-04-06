import * as THREE from "three";

export default () => {
  const direction = new THREE.Vector3();
  const actions = {
    KeyW: (x) => direction.setX(x),
    KeyS: (x) => direction.setX(-x),
    KeyA: (x) => direction.setZ(-x),
    KeyD: (x) => direction.setZ(x),
    Space: (x) => direction.setY(x),
  };

  return {
    trigger: (code) => actions[code] && actions[code](1),
    release: (code) => actions[code] && actions[code](0),
    reset: () => direction.set(0, 0, 0),
    fromCoordinates: (camera) => {
      const directionWorld = new THREE.Vector4(
        direction.x,
        direction.y,
        -direction.z,
        0
      );
      const directionCamera = directionWorld
        .clone()
        .applyMatrix4(camera.matrixWorldInverse)
        .normalize();

      return new THREE.Vector3().set(
        -directionCamera.z,
        directionWorld.y,
        -directionCamera.x
      );
    },
  };
};
