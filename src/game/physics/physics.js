import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugRenderer from "./debugger.js";

export const getPhysicBody = (
  mesh,
  type = CANNON.Box,
  options = {}
) /* THREE.Object3D */ => {
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

const diff = (a, b) => new Set([...a].filter((x) => !new Set(b).has(x)));

export default ({ scene, fps, debug = false }) => {
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  const shape = new CANNON.Plane();
  const body = new CANNON.Body({ mass: 0, shape });
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  body.position.y -= 1;
  world.add(body);

  const cannonDebugRenderer = debug
    ? new CannonDebugRenderer(scene, world)
    : null;
  
  let currentBodies = [];
  return {
    updateBodies: (bodies) => {
      const toAdd = diff(bodies, currentBodies);
      const toRemove = diff(currentBodies, bodies);
      toAdd.forEach((body) => world.add(body));
      toRemove.forEach((body) => world.remove(body));
      currentBodies = bodies;
    },
    manager: {
      update: () => {
        if (cannonDebugRenderer) cannonDebugRenderer.update();
        world.step(1 / fps);
      },
    },
  };
};
