import * as THREE from "three";

import Orbit from "./orbit.js";
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

  const prevMousePosUnit = new THREE.Vector2();
  let isDragging = false;

  let collideObjects = [];
  let radiusBeforeCollision = orbit.sphere.radius;

  const direction = new THREE.Vector3();
  const shiftDirection = new THREE.Vector3();
  const target = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  raycaster.near = 5;

  return freeze({
    setCollideObjects: (objects) => {
      collideObjects = objects;
    },
    setTarget: (newTarget) => {
      target.copy(newTarget);
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
          radiusBeforeCollision = orbit.sphere.radius - 0.01;
        },
      },
      update: () => {
        camera.getWorldDirection(direction);
        direction.multiplyScalar(-1);

        let distance = +Infinity;
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 3; j++) {
            raycaster.set(
              target,
              shiftDirection
                .copy(direction)
                .applyAxisAngle(
                  axis.set(Number(j === 0), Number(j === 1), Number(j === 2)),
                  (i === 0 ? 1 : -1) * Math.PI * 0.1
                )
            );
            raycaster.far = orbit.sphere.radius + 5;

            const intersects = raycaster.intersectObjects(collideObjects);
            if (intersects.length) {
              distance = Math.min(intersects[0].distance, distance);
            }
          }
        }

        orbit.sphere.radius =
          distance === +Infinity ? radiusBeforeCollision : distance - 1;

        const position = orbit.toCartesianCoordinates().add(target);
        camera.position.copy(position);
        camera.lookAt(target);
      },
    },
  });
};
