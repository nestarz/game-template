import * as THREE from "three";
import * as CANNON from "cannon-es";

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

import { getPhysicBody } from "../physics/physics.js";
import InputControls from "./input.js";

const safeHack = new CANNON.Vec3(0, 1, 0);
const vToGround = new CANNON.Vec3(0, -1, 0);

const temp0 = new THREE.Vector3();
const isGrounded = (groundMesh, body, direction = vToGround) => {
  const raycaster = new THREE.Raycaster(
    temp0.copy(body.position.vadd(safeHack)),
    direction,
    0,
    +Infinity
  );
  const intersects = raycaster.intersectObjects([groundMesh]);
  return intersects && intersects[0];
};

export const Player = async () => {
  const speed = new CANNON.Vec3(50, 10, 50);
  const controls = InputControls();

  const path = "assets/models/girl/girl.stl";
  const geometry = await new Promise((r) => new STLLoader().load(path, r));
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 500, 0);
  mesh.scale.set(22, 22, 22);

  const body = getPhysicBody(mesh, CANNON.Sphere, {
    fixedRotation: true,
    mass: 5,
    material: new CANNON.Material({
      friction: 0,
      restitution: 0,
    }),
  });

  let ground = null;
  body.addEventListener("collide", ({ contact: { bi, bj } }) => {
    if (!ground) {
      const ray = new CANNON.Ray(body.position.vadd(safeHack), vToGround);
      const result1 = new CANNON.RaycastResult();
      const result2 = new CANNON.RaycastResult();
      ray.intersectBody(bi, result1);
      ray.intersectBody(bj, result2);
      if (result1.hasHit || result2.hasHit) {
        ground = bi === body ? bj : bi;
      }
    }
  });

  const spherical = new THREE.Spherical();
  const direction = new THREE.Vector3();
  const prevPosition = new CANNON.Vec3();

  return {
    get position() {
      return new THREE.Vector3().copy(body.position);
    },
    get spherical() {
      return spherical;
    },
    inUserMovement: () => controls.rotation.x || controls.direction.length(),
    manager: {
      objects: [{ name: "Player", mesh, body }],
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
            .clone()
            .multiply(speed)
            .multiplyScalar(ground ? 1 : 0.5);

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

        if (ground && !body.position.almostEquals(prevPosition, 0.2)) {
          const intersect = isGrounded(ground.mesh, body);
          if (intersect && intersect.distance > 1.6) {
            body.velocity.y = -10 * intersect.distance;
          }
        }

        // Match visual with physics
        prevPosition.copy(body.position);
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);

        // Update Player Spherical from Mesh Direction
        mesh.getWorldDirection(direction).multiplyScalar(-1);
        spherical.setFromVector3(direction);
      },
    },
  };
};
