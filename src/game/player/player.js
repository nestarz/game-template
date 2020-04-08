import * as THREE from "three";
import * as CANNON from "cannon-es";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { getPhysicBody } from "../physics/physics.js";
import InputControls from "./input.js";

export const Player = async () => {
  const speed = new CANNON.Vec3(200, 10, 200);
  const controls = InputControls();

  const path = "assets/models/girl/girl.stl";
  const geometry = await new Promise((r) => new STLLoader().load(path, r));
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 500, 0);
  mesh.scale.set(22, 22, 22);

  const body = getPhysicBody(mesh, CANNON.Sphere, {
    fixedRotation: true,
    mass: 500,
    material: new CANNON.Material({
      friction: 0,
      restitution: 0,
    }),
  });

  let grounded = false;
  body.addEventListener("collide", ({ contact }) => {
    if (!grounded) {
      const to = new CANNON.Vec3(0, -1, 0);
      const ray = new CANNON.Ray(body.position, to);
      ray.updateDirection();
      ray.intersectBody(contact.bi);
      grounded = ray.result.hasHit;
    }
  });

  const spherical = new THREE.Spherical();
  const direction = new THREE.Vector3();

  return {
    get position() {
      return new THREE.Vector3().copy(body.position);
    },
    get spherical() {
      return spherical;
    },
    inUserMovement: () => controls.rotation.x || controls.direction.length(),
    manager: {
      objects: [{ mesh, body }],
      keyEvents: {
        keydown: (e) => controls.trigger(e.code),
        keyup: (e) => controls.release(e.code),
        blur: () => controls.reset(),
        focus: () => controls.reset(),
      },
      update: () => {
        // Move Player relatively to his facing direction and his state
        if (controls.direction.length()) {
          const direction = controls
            .fromTransformMatrix(body.position, body.quaternion)
            .multiply(speed)
            .multiplyScalar(grounded ? 1 : 0.5);

          body.velocity.set(direction.x, body.velocity.y, direction.z);
        }

        // Rotate Player based on Input State
        if (controls.rotation.length()) {
          const quaternion = new CANNON.Quaternion();
          quaternion.setFromAxisAngle(
            new CANNON.Vec3(0, 1, 0),
            -controls.rotation.x * 0.1
          );
          body.quaternion = body.quaternion.mult(quaternion);
        }

        // Jump if player is grounded and direction up
        if (grounded && controls.direction.y) {
          body.velocity.y = 10;
          grounded = false;
        }

        // Match visual with physics
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);

        // Update Player Spherical from Mesh Direction
        mesh.getWorldDirection(direction).multiplyScalar(-1);
        spherical.setFromVector3(direction);
      },
    },
  };
};
