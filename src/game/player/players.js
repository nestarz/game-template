import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { getPhysicBody } from "../physics/physics.js";
import Direction from "./keyboard.js";

export const Player = async (world, camera, controls) => {
  const speed = 50;
  const direction = Direction(camera);

  const path = "assets/models/girl/girl.stl";
  const geometry = await new Promise((r) => new STLLoader().load(path, r));
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-50, 22, -100);
  mesh.scale.set(22, 22, 22);

  const body = getPhysicBody(mesh, { fixedRotation: true, mass: 20 });
  world.addBody(body);

  return {
    getPosition: () => mesh.position,
    manager: {
      objects: [mesh],
      keyEvents: {
        keydown: (e) => direction.add(e.key),
        keyup: (e) => direction.remove(e.key),
      },
      update: () => {
        const velocity = direction.get().multiplyScalar(speed);
        body.velocity.set(velocity.x, velocity.y, velocity.z);

        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);

        const lookAt = new THREE.Vector3(0, 10, 0).add(body.position.clone());
        camera.lookAt(lookAt);

        if (controls) {
          controls.target = lookAt;
        }
      },
    },
  };
};
