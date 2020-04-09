import * as THREE from "three";
import * as CANNON from "cannon-es";

import { computeBodyFromMesh } from "../physics/computeBody.js";

export default () => {
  const N = 100;
  const myGeom = new THREE.BoxGeometry(10, 100, 10);
  const myMaterial = new THREE.MeshBasicMaterial({ color: "black" });
  const objects = [];

  const random = () => 1000 - Math.random() * 2000;
  for (let i = 0; i < N; i++) {
    const mesh = new THREE.Mesh(myGeom, myMaterial);
    mesh.position.set(random(), 700 + Math.random() * 900, random());

    const body = computeBodyFromMesh(mesh, CANNON.Sphere, {
      fixedRotation: false,
      mass: 100,
      position: mesh.position,
      material: new CANNON.Material({
        friction: 0,
        restitution: 0,
      }),
    });

    objects.push({ name: "Fall" + i, mesh, body });
  }

  return {
    manager: {
      objects,
      update: () => {
        for (let i = 0; i < objects.length; i++) {
          const { mesh, body } = objects[i];
          body.velocity.x += 10 - Math.random() * 20;
          mesh.position.copy(body.position);
          mesh.quaternion.copy(body.quaternion);
        }
      },
    },
  };
};
