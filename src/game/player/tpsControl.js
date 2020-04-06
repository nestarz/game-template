import * as THREE from "three";

const OrbitState = (options = {}) => {
  let phi = 0;
  let theta = 0;
  let radius = options.radius || 60;
  let min = options.min || 50;
  let max = options.max || 80;

  return {
    moveEuler: (thetaDelta, phiDelta) => {
      theta += thetaDelta;
      phi += phiDelta;
    },
    setPhi: (newPhi) => {
      phi = newPhi % (Math.PI);
    },
    move: (delta) => {
      theta = (theta + delta.x * 0.1 * Math.PI) % (2 * Math.PI);
      phi = (phi - delta.y * 0.1 * Math.PI) % Math.PI;
    },
    zoom: (zoom) => {
      radius = Math.min(Math.max(radius + zoom, min), max);
    },
    toXYZ: () => {
      // https://en.wikipedia.org/wiki/Spherical_coordinate_system#Cartesian_coordinates
      const pos = new THREE.Vector3(
        // Math.sin(theta) * Math.cos(phi), //Math.cos(phi) * Math.cos(theta + Math.PI / 2),
        // Math.sin(theta) * Math.sin(phi), //Math.sin(phi),
        // Math.cos(phi) //Math.cos(phi) * Math.sin(theta + Math.PI / 2)
        -Math.cos(phi) * Math.sin(theta + Math.PI / 2),
        Math.cos(phi) * Math.cos(theta + Math.PI / 2),
        Math.sin(phi),
      ).multiplyScalar(radius);
      console.log(pos);
      return pos;
    },
  };
};

const computeMousePosUnit = ({ clientX, clientY, currentTarget }) =>
  new THREE.Vector2(
    clientX / currentTarget.offsetWidth,
    clientY / currentTarget.offsetHeight
  );

export const TPSControl = (camera) => {
  const mouseAcceleration = new THREE.Vector2(1, 1);
  const offset = new THREE.Vector3(0, 0, 0);
  const orbit = OrbitState();

  let target = new THREE.Vector3(0, 0, 0);
  let prevMousePosUnit = new THREE.Vector2(0, 0);
  let isMousedown = false;
  return {
    set target(newTarget) {
      target.copy(newTarget);
    },
    rotateEuler: orbit.moveEuler,
    setPhi: (...args) => orbit.setPhi(...args),
    manager: {
      keyEvents: {
        mousemove: (event) => {
          if (!isMousedown) return;

          const delta = computeMousePosUnit(event).sub(prevMousePosUnit);
          const scaled = delta.clone().multiply(mouseAcceleration);
          orbit.move(scaled);
        },
        mousedown: (event) => {
          isMousedown = true;
          prevMousePosUnit.copy(computeMousePosUnit(event));
        },
        mouseup: () => {
          isMousedown = false;
        },
        wheel: (event) => orbit.zoom(event.deltaY),
      },
      update: () => {
        console.log(orbit.toXYZ());
        const position = target.clone().add(offset).add(orbit.toXYZ());
        camera.position.copy(position);
        camera.lookAt(target);
      },
    },
  };
};
