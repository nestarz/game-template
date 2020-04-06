import * as THREE from "three";
import * as CANNON from "cannon-es";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { getPhysicBody } from "../physics/physics.js";
import MoveControls from "./controls.js";

export const Player = async (world, camera, controls) => {
  const speed = new CANNON.Vec3(50, 10, 50);
  const moveControls = MoveControls();

  const path = "assets/models/girl/girl.stl";
  const geometry = await new Promise((r) => new STLLoader().load(path, r));
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-50, 22, -100);
  mesh.scale.set(22, 22, 22);

  const body = getPhysicBody(mesh, { fixedRotation: true, mass: 10 });
  world.addBody(body);

  let grounded = false;
  body.addEventListener("collide", ({ contact }) => {
    if (!grounded) {
      const vTo = new CANNON.Vec3(0, -1, 0);
      const ray = new CANNON.Ray(body.position, vTo);
      ray.updateDirection();
      ray.intersectBody(contact.bi);
      grounded = ray.result.hasHit;
    }
  });

  return {
    getPosition: () => body.position.clone(),
    setPosition: (x, y, z) => body.position.set(x, y, z),
    manager: {
      objects: [mesh],
      keyEvents: {
        keydown: (e) => moveControls.trigger(e.code),
        keyup: (e) => moveControls.release(e.code),
        blur: () => moveControls.reset(),
        focus: () => moveControls.reset(),
      },
      update: () => {
        const input = moveControls
          .fromCoordinates(camera)
          .multiply(speed)
          .multiplyScalar(grounded ? 1 : 0.5);

        body.velocity.set(input.x, body.velocity.y, input.z);

        if (grounded && input.y) {
          body.velocity.y = 10;
          grounded = false;
        }

        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);

        const lookAt = new THREE.Vector3(0, 10, 0).add(body.position.clone());
        camera.lookAt(lookAt);

        if (controls) {
          controls.target = lookAt;
          controls.update && controls.update();
        }
      },
    },
  };
};
