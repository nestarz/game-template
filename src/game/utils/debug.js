import * as THREE from "three";

const directionTHREE = new THREE.Vector3();
const originTHREE = new THREE.Vector3();
export const directionMesh = (origin, direction, scale = 20) =>
  new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      origin,
      originTHREE
        .copy(origin)
        .add(directionTHREE.copy(direction).normalize().multiplyScalar(scale)),
    ]),
    new THREE.LineBasicMaterial({
      color: "yellow",
    })
  );
