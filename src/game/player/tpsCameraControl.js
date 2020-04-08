import * as THREE from "three";

import Orbit from "./orbit.js";
import collisionDistance from "./collision.js";
import { freeze } from "../utils/safe.js";

const computeMousePosUnit = ({ clientX, clientY, currentTarget }) =>
  freeze(
    new THREE.Vector2(
      clientX / currentTarget.offsetHeight,
      clientY / currentTarget.offsetWidth
    )
  );

export const TPSCameraControl = ({ camera }) => {
  const orbit = Orbit({
    radius: 100,
    phi: Math.PI / 2,
    theta: Math.PI / 3,
    min: 20,
    max: 150,
  });

  let prevMousePosUnit = new THREE.Vector2();
  let isDragging = false;

  let collideObjects = [];
  let radiusBeforeCollision = orbit.sphere.radius;

  const direction = new THREE.Vector3();
  let target = new THREE.Vector3();

  return freeze({
    setCollideObjects: (objects) => {
      collideObjects = objects;
    },
    setTarget: (newTarget) => {
      target = new THREE.Vector3().copy(newTarget);
    },
    setAzimuthIfNotDragging: (theta) => {
      if (!isDragging) {
        orbit.sphere.theta = theta;
      }
    },
    manager: {
      keyEvents: {
        mousemove: (event) => {
          if (!isDragging) return;

          const mousePosUnit = computeMousePosUnit(event);
          const delta = mousePosUnit.clone().sub(prevMousePosUnit);
          orbit.rotate(delta);

          prevMousePosUnit.copy(mousePosUnit);
        },
        mousedown: (event) => {
          isDragging = true;
          prevMousePosUnit.copy(computeMousePosUnit(event));
        },
        mouseup: () => {
          isDragging = false;
        },
        wheel: (event) => {
          orbit.zoom(event.deltaY * 0.01);
          radiusBeforeCollision = orbit.sphere.radius;
        },
      },
      update: () => {
        camera.getWorldDirection(direction);
        direction.multiplyScalar(-1);

        const distance = collisionDistance({
          origin: target,
          direction,
          radius: orbit.sphere.radius,
          objects: collideObjects,
        });

        orbit.sphere.radius =
          distance === +Infinity ? radiusBeforeCollision : distance;

        const position = orbit.toCartesianCoordinates().add(target);
        camera.position.copy(position);
        camera.lookAt(target);
      },
    },
  });
};
