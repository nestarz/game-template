import * as THREE from "three";
import * as CANNON from "cannon-es";

const mesher = {
  [CANNON.Shape.types.HEIGHTFIELD]: (shape) => {
    if (shape.type !== CANNON.Shape.types.HEIGHTFIELD) throw Error();
    
    const geometry = new THREE.Geometry();
    const v0 = new CANNON.Vec3();
    const v1 = new CANNON.Vec3();
    const v2 = new CANNON.Vec3();
    for (let xi = 0; xi < shape.data.length - 1; xi++) {
      for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
        for (let k = 0; k < 2; k++) {
          shape.getConvexTrianglePillar(xi, yi, k === 0);
          v0.copy(shape.pillarConvex.vertices[0]);
          v1.copy(shape.pillarConvex.vertices[1]);
          v2.copy(shape.pillarConvex.vertices[2]);
          v0.vadd(shape.pillarOffset, v0);
          v1.vadd(shape.pillarOffset, v1);
          v2.vadd(shape.pillarOffset, v2);
          geometry.vertices.push(
            new THREE.Vector3(v0.x, v0.y, v0.z),
            new THREE.Vector3(v1.x, v1.y, v1.z),
            new THREE.Vector3(v2.x, v2.y, v2.z)
          );
          const i = geometry.vertices.length - 3;
          geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
        }
      }
    }
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();

    return geometry;
  },
};

export const createGeometryFromCannonShape = (shape) => {
  return mesher[shape.type](shape);
};
