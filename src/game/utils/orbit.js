import * as THREE from "three";

import { safe, freeze } from "./safe.js";

const preventGimbleLock = (phi) => {
  const EPS = 0.000001;
  return Math.max(EPS, Math.min(Math.PI - EPS, phi));
};

const Spherical = ({ radius = 1, phi = 0, theta = 0 } = {}) =>
  safe({
    get phi() {
      return phi;
    },
    set phi(value) {
      phi = preventGimbleLock(value);
    },
    theta,
    radius,
  });

export default ({
  radius = 1,
  phi = 0,
  theta = 0,
  min = 0,
  max = +Infinity,
} = {}) => {
  const sphere = Spherical({ radius, phi, theta });
  const xyz = new THREE.Vector3();

  return freeze({
    sphere,
    zoom: (zoom) => {
      sphere.radius = Math.min(Math.max(sphere.radius + zoom, min), max);
    },
    rotate: (delta) => {
      sphere.theta = (sphere.theta - delta.x * Math.PI) % (2 * Math.PI);
      sphere.phi = (sphere.phi - delta.y * Math.PI) % (2 * Math.PI);
    },
    toCartesianCoordinates: () =>
      xyz.set(
        sphere.radius * Math.sin(sphere.phi) * Math.sin(sphere.theta),
        sphere.radius * Math.cos(sphere.phi),
        sphere.radius * Math.sin(sphere.phi) * Math.cos(sphere.theta)
      ),
  });
};
