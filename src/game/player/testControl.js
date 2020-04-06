import * as THREE from "three";

const tempVec2a = new THREE.Vector2();
const tempVec2b = new THREE.Vector2();

export const Orbit = (
  object,
  {
    element = document,
    target = new THREE.Vector3(1, 1, 1),
    ease = 0.25,
    inertia = 0.01,
    rotateSpeed = 0.6,
    minPolarAngle = 0,
    maxPolarAngle = Math.PI,
    minAzimuthAngle = -Infinity,
    maxAzimuthAngle = Infinity,
    minDistance = 50,
    maxDistance = Infinity,
  } = {}
) => {
  // Catch attempts to disable - set to 1 so has no effect
  ease = ease || 1;
  inertia = inertia || 1;

  // current position in sphericalTarget coordinates
  const sphericalDelta = { radius: 1, phi: 0, theta: 0 };
  const sphericalTarget = { radius: 1, phi: 0, theta: 0 };
  const spherical = { radius: 1, phi: 0, theta: 0 };
  const panDelta = new THREE.Vector3();

  // Grab initial position values
  const offset = new THREE.Vector3();
  offset.copy(object.position).sub(target);
  spherical.radius = sphericalTarget.radius = offset.length();
  spherical.theta = sphericalTarget.theta = Math.atan2(offset.x, offset.z);
  spherical.phi = sphericalTarget.phi = Math.acos(
    Math.min(Math.max(offset.y / sphericalTarget.radius, -1), 1)
  );

  // Everything below here just updates panDelta and sphericalDelta
  // Using those two objects' values, the orbit is calculated

  const rotateStart = new THREE.Vector2();
  let isMousedown = false;

  return {
    set target(newTarget) {
      target.copy(newTarget);
    },
    manager: {
      keyEvents: {
        mousemove: ({ clientX: x, clientY: y }) => {
          if (!isMousedown) return;

          tempVec2a.set(x, y);
          tempVec2b
            .copy(tempVec2a.clone().sub(rotateStart))
            .multiplyScalar(rotateSpeed);
          let el = element === document ? document.body : element;
          sphericalDelta.theta -= (2 * Math.PI * tempVec2b.x) / el.clientHeight;
          sphericalDelta.phi -= (2 * Math.PI * tempVec2b.y) / el.clientHeight;
          rotateStart.copy(tempVec2a);
        },
        mousedown: (event) => {
          isMousedown = true;
          rotateStart.set(event.clientX, event.clientY);
        },
        mouseup: () => {
          isMousedown = false;
        },
      },
      update: () => {
        // apply delta
        sphericalTarget.radius *= sphericalDelta.radius;
        sphericalTarget.theta += sphericalDelta.theta;
        sphericalTarget.phi += sphericalDelta.phi;
        // apply boundaries
        sphericalTarget.theta = Math.max(
          minAzimuthAngle,
          Math.min(maxAzimuthAngle, sphericalTarget.theta)
        );
        sphericalTarget.phi = Math.max(
          minPolarAngle,
          Math.min(maxPolarAngle, sphericalTarget.phi)
        );
        sphericalTarget.radius = Math.max(
          minDistance,
          Math.min(maxDistance, sphericalTarget.radius)
        );

        // ease values
        spherical.phi += (sphericalTarget.phi - spherical.phi) * ease;
        spherical.theta += (sphericalTarget.theta - spherical.theta) * ease;
        spherical.radius += (sphericalTarget.radius - spherical.radius) * ease;

        // apply pan to target. As offset is relative to target, it also shifts
        target.add(panDelta);

        // apply rotation to offset
        const sinPhiRadius =
          spherical.radius * Math.sin(Math.max(0.000001, spherical.phi));
        offset.x = sinPhiRadius * Math.sin(spherical.theta);
        offset.y = spherical.radius * Math.cos(spherical.phi);
        offset.z = sinPhiRadius * Math.cos(spherical.theta);

        // Apply updated values to object
        object.position.copy(target).add(offset);
        object.lookAt(target);

        // Apply inertia to values
        sphericalDelta.theta *= inertia;
        sphericalDelta.phi *= inertia;
        panDelta.multiplyScalar(inertia);

        // Reset scale every frame to avoid applying scale multiple times
        sphericalDelta.radius = 1;
      },
    },
  };
};
