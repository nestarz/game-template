import * as THREE from "three";

export default () => {
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(-1000, 1000, 0);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-1000, 600, 10);

  return {
    manager: {
      objects: [sun, spotLight],
    },
  };
};
