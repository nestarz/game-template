import * as THREE from "three";
import * as CANNON from "cannon-es";

export const computeBodyFromMesh = (mesh, type = CANNON.Box, options = {}) => {
  mesh.updateMatrixWorld();
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
  const size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
  const box =
    type === CANNON.Sphere
      ? new CANNON.Sphere((Math.max(size.x, size.y) * mesh.scale.y) / 2)
      : new CANNON.Box(new CANNON.Vec3().copy(size).scale(mesh.scale.y / 2));

  const body = new CANNON.Body({
    mass: 1,
    position: new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld),
    quaternion: mesh.quaternion.clone(),
    ...options,
  });
  const { center } = mesh.geometry.boundingSphere;
  body.addShape(
    box,
    new CANNON.Vec3(center.x, center.y * mesh.scale.y, center.z)
  );
  return body;
};
