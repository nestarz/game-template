import * as THREE from "three";

const OrbitState = (options = {}) => {
  let phi = Math.PI / 2;
  let theta = 0;
  let radius = options.radius || 60;
  let min = options.min || 50;
  let max = options.max || 80;

  return {
    move: (delta) => {
      theta = (theta + delta.x * 0.01 * Math.PI) % (2 * Math.PI);
      // phi = (theta + delta.y * 0.01 * Math.PI) % (Math.PI);
      // console.log(theta / Math.PI, "PI");
      // phi = (phi + delta.y * THREE.Math.DEG2RAD) % (2 * Math.PI);
    },
    zoom: (zoom) => {
      radius = Math.min(Math.max(radius + zoom, min), max);
    },
    toXYZ: () => {
      // https://en.wikipedia.org/wiki/Spherical_coordinate_system#Cartesian_coordinates
      const pos = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi), //Math.cos(phi) * Math.cos(theta + Math.PI / 2),
        Math.sin(theta) * Math.sin(phi), //Math.sin(phi),
        Math.cos(phi) //Math.cos(phi) * Math.sin(theta + Math.PI / 2)
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
    lookAt: (newTarget) => {
      target = newTarget;
    },
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
        console.clear();
        const position = target.clone().add(offset).add(orbit.toXYZ());
        camera.position.copy(position);
        camera.lookAt(target);
        orbit.move(new THREE.Vector2(1, 1));
      },
    },
  };
};
