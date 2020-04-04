import * as THREE from "three";
import config from "../config/config.js";

export const Floor = () => {
  const geometry = new THREE.PlaneGeometry(100, 100, 100);
  const material = new THREE.MeshPhongMaterial({
    color: config.MAIN_COLOR,
    specular: config.SECONDARY_COLOR,
    shininess: 5,
    opacity: 0.2,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI * 0.5);
  return {
    manager: {
      objects: [plane],
      update: () => {},
    },
  };
};
