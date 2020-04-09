import * as THREE from "three";
import * as CANNON from "cannon-es";

import perlin from "../utils/perlin.js";
import { createGeometryFromCannonShape } from "../utils/cannon-utils.js";

export default () => {
  const elementSize = 150;
  const size = new CANNON.Vec3(40, 1900, 40);
  const matrix = Array.from({ length: size.x }, () => new Float32Array(size.z));
  for (let i = 0; i < size.x; i++) {
    for (let j = 0; j < size.z; j++) {
      const height =
        perlin((i / size.x) * 4, (j / size.z) * 4, i / size.x) * size.y;
      matrix[i][j] = height;
    }
  }

  const material = new CANNON.Material("groundMaterial");
  const ground_ground_cm = new CANNON.ContactMaterial(material, material, {
    friction: 0,
    restitution: 0,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRegularizationTime: 3,
  });

  const shape = new CANNON.Heightfield(matrix, {
    elementSize,
  });

  const body = new CANNON.Body({ mass: 0, material });
  body.addShape(shape);
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  body.position.set(
    (-size.x * shape.elementSize) / 2,
    -shape.minValue,
    (size.z * shape.elementSize) / 2
  );

  const geometry = createGeometryFromCannonShape(shape);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: "black",
      specular: "white",
      shininess: 0.05,
      flatShading: THREE.FlatShading,
    })
  );

  mesh.position.copy(body.position.vadd(new CANNON.Vec3(0, 0.2, 0)));
  mesh.quaternion.copy(body.quaternion);
  mesh.visible = true;

  return {
    manager: {
      objects: [
        { name: "Mountains", body, mesh },
        { contactMaterial: ground_ground_cm },
      ],
      update: (t) => {
        // body.velocity.x += Math.sin(t / 10) * 1;
        // mesh.position.copy(body.position);
      }
    },
  };
};
