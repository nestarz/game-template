import * as THREE from "three";
import * as CANNON from "cannon-es";

import perlin from "../utils/perlin.js";
import { createGeometryFromCannonShape } from "../utils/cannon-utils.js";

export default () => {
  const size = new CANNON.Vec3(20, 1900, 20);
  const matrix = Array.from({ length: size.x }, () => new Float32Array(size.z));
  let minValue = +Infinity;
  for (let i = 0; i < size.x; i++) {
    for (let j = 0; j < size.z; j++) {
      const height =
        perlin((i / size.x) * 4, (j / size.z) * 4, i / size.x) * size.y;
      matrix[i][j] = height;
      minValue = Math.min(minValue, height);
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
    elementSize: 300,
  });

  const body = new CANNON.Body({ mass: 0, material });
  body.addShape(shape);
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  body.position.set(
    (-size.x * shape.elementSize) / 2,
    -minValue,
    (size.z * shape.elementSize) / 2
  );

  const geometry = createGeometryFromCannonShape(shape);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhongMaterial({
      color: 0x030303,
      color: "red",
      specular: 0x009900,
      shininess: 30,
      flatShading: THREE.FlatShading,
    })
  );

  mesh.position.copy(body.position.vadd(new CANNON.Vec3(0, 0.8, 0)));
  mesh.quaternion.copy(body.quaternion);

  return {
    manager: {
      objects: [{ mesh, body }, { contactMaterial: ground_ground_cm }],
    },
  };
};
