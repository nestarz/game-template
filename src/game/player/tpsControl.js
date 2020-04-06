import * as THREE from "three";

const computeMousePosUnit = ({ clientX, clientY, currentTarget }) =>
  new THREE.Vector2(
    clientX / currentTarget.offsetHeight,
    clientY / currentTarget.offsetWidth
  );

const Orbit = (radius = 1, phi = 0, theta = 0, min = 0, max = +Infinity) => {
  const makeSafe = (_phi) => {
    const EPS = 0.000001;
    return Math.max(EPS, Math.min(Math.PI - EPS, _phi));
  };
  return {
    zoom: (zoom) => {
      radius = Math.min(Math.max(radius + zoom, min), max);
    },
    rotate: (delta) => {
      theta = (theta - delta.x * Math.PI) % (2 * Math.PI);
      phi = makeSafe((phi - delta.y * Math.PI) % (2 * Math.PI));
    },
    toCartesianCoordinates: () => {
      const sinPhiRadius = Math.sin(phi) * radius;

      return new THREE.Vector3().set(
        sinPhiRadius * Math.sin(theta),
        Math.cos(phi) * radius,
        sinPhiRadius * Math.cos(theta)
      );
    },
  };
};

export const TPSControl = (camera) => {
  const orbit = Orbit(100, 1, 1, 20, 150);

  let target = new THREE.Vector3(0, 0, 0);
  let prevMousePosUnit = new THREE.Vector2(0, 0);
  let isMousedown = false;
  return {
    set target(newTarget) {
      target.copy(newTarget);
    },
    manager: {
      keyEvents: {
        mousemove: (event) => {
          if (!isMousedown) return;

          const delta = computeMousePosUnit(event).sub(prevMousePosUnit);
          orbit.rotate(delta);
          prevMousePosUnit.copy(computeMousePosUnit(event));
        },
        mousedown: (event) => {
          isMousedown = true;
          prevMousePosUnit.copy(computeMousePosUnit(event));
        },
        mouseup: () => {
          isMousedown = false;
        },
        wheel: (event) => orbit.zoom(event.deltaY * 0.01),
      },
      update: () => {
        const position = target.clone().add(orbit.toCartesianCoordinates());
        camera.position.copy(position);
        camera.lookAt(target);
      },
    },
  };
};
