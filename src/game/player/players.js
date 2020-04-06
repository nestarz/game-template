import * as THREE from "three";
import * as CANNON from "cannon-es";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { getPhysicBody } from "../physics/physics.js";
import MoveControls from "./controls.js";

export const Player = async (world, controls) => {
  const offset = new THREE.Vector3(0, 10, 0);
  const speed = new CANNON.Vec3(50, 10, 50);
  const moveControls = MoveControls({
    moveforward: true,
    movebackward: true,
    rotateleft: true,
    rotateright: true,
    jump: true,
  });

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
        keydown: (e) => moveControls.trigger(e.code),
        keyup: (e) => moveControls.release(e.code),
        blur: () => moveControls.reset(),
        focus: () => moveControls.reset(),
      },
      update: () => {
        const input = moveControls
          // .fromTransformMatrix(camera.position, camera.quaternion)
          .fromTransformMatrix(body.position, body.quaternion)
          .multiply(speed)
          .multiplyScalar(grounded ? 1 : 0.5);

        console.log(input.x, input.z);
        console.log(moveControls.direction.x, moveControls.direction.z);
        body.velocity.set(input.x, body.velocity.y, input.z);

        const rotationQuaternion = new CANNON.Quaternion();
        rotationQuaternion.setFromAxisAngle(
          new CANNON.Vec3(0, 1, 0),
          -input.phi * 0.1
        );
        body.quaternion = body.quaternion.mult(rotationQuaternion);

        if (grounded && input.y) {
          body.velocity.y = 10;
          grounded = false;
        }

        if (controls) {
          controls.target = body.position.vadd(offset);

          // if (input.phi || input.length()) {
          //   const rotation = new THREE.Euler().setFromQuaternion(
          //     new THREE.Quaternion().copy(body.quaternion)
          //   );
          //   console.log(rotation);
          //   controls.setPhi(rotation.y);
          // }
        }

        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
      },
    },
  };
};
