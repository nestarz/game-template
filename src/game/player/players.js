import * as THREE from "three";
import * as CANNON from "cannon-es";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { getPhysicBody } from "../physics/physics.js";
import InputControls from "./input.js";

export const Player = async (world, controls) => {
  const offset = new THREE.Vector3(0, 10, 0);
  const speed = new CANNON.Vec3(50, 10, 50);
  
  const inputControls = InputControls();

  const path = "assets/models/girl/girl.stl";
  const geometry = await new Promise((r) => new STLLoader().load(path, r));
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 5, 0);
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
        keydown: (e) => inputControls.trigger(e.code),
        keyup: (e) => inputControls.release(e.code),
        blur: () => inputControls.reset(),
        focus: () => inputControls.reset(),
      },
      update: () => {
        // Get input rotation and direction
        const rotation = inputControls.getRotation();
        const direction = inputControls.getDirection();

        // Move Player relatively to his facing direction and his state
        if (direction.length()) {
          const direction = inputControls
            .fromTransformMatrix(body.position, body.quaternion)
            .multiply(speed)
            .multiplyScalar(grounded ? 1 : 0.5);

          body.velocity.set(direction.x, body.velocity.y, direction.z);
        }

        // Rotate Player based on Input State
        if (rotation.length()) {
          const quaternion = new CANNON.Quaternion();
          quaternion.setFromAxisAngle(
            new CANNON.Vec3(0, 1, 0),
            -rotation.x * 0.1
          );
          body.quaternion = body.quaternion.mult(quaternion);
        }

        // Jump if player is grounded and direction up
        if (grounded && direction.y) {
          body.velocity.y = 10;
          grounded = false;
        }

        // Let the control system follow the player
        if (controls) {
          controls.target = body.position.vadd(offset);

          // Update the new direction to the control system
          if (rotation.x || direction.length()) {
            const direction = new THREE.Vector3();
            mesh.getWorldDirection(direction).multiplyScalar(-1);
            const rotation = new THREE.Spherical().setFromVector3(direction);
            controls.setAzimuth(rotation.theta);
          }
        }
        
        // Match visual with physics
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
      },
    },
  };
};
