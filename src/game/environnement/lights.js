import * as THREE from "three";

export default () => {
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(-1000, 1000, 0);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-1000, 600, 10);

  return {
    manager: {
      objects: [
        { name: "sun", mesh: sun },
        { name: "spotlight", mesh: spotLight },
      ],
      update: (t) => {
        spotLight.position.x = Math.sin(t / 100) * 1000;
        spotLight.position.y = -Math.cos(t / 100) * 1000;
      },
    },
  };
};
