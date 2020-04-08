import * as THREE from "three";
import * as CANNON from "cannon-es";

const material = new THREE.MeshBasicMaterial();

export default async (world) => {
  const wordsList = [];
  const add = async (text) => {
    const path = "assets/fonts/helvetiker_bold.typeface.json";
    const font = await new Promise((r, e) =>
      new THREE.FontLoader().load(path, r, null, e)
    );
    const fontOption = (scale) => ({
      font,
      size: 29 * scale,
      height: 0.33 * scale,
      curveSegments: 2 * scale,
      bevelEnabled: true,
      bevelThickness: 1 * scale,
      bevelSize: 0.34 * scale,
      bevelOffset: 0,
      bevelSegments: 8,
    });
    const words = new THREE.Group();
    const totalMass = 1;
    words.letterOff = 0;

    Array.from(text).forEach((letter) => {
      const geometry = new THREE.TextBufferGeometry(letter, fontOption(2));

      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const mesh = new THREE.Mesh(geometry, material);
      mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
      words.letterOff += mesh.size.x || 4;
      const box = new CANNON.Box(new CANNON.Vec3().copy(mesh.size).scale(0.5));
      mesh.body = new CANNON.Body({
        mass: 3000 * (totalMass / text.length),
        position: new CANNON.Vec3(
          50 + 1.1 * words.letterOff,
          10 + Math.sin(words.letterOff) * 5,
          -60 + (wordsList.length % 3) * 25
        ),
      });

      const { center } = mesh.geometry.boundingSphere;
      mesh.body.addShape(
        box,
        new CANNON.Vec3(center.x, center.y + 30, center.z)
      );
      world.addBody(mesh.body);
      words.add(mesh);
    });

    words.children.forEach((letter) => {
      letter.body.position.x -=
        wordsList.length < 3 ? 50 : wordsList.length % 2 ? -10 : 120;
      letter.body.position.x -= letter.size.x + words.letterOff * 0.5;
    });

    wordsList.push(words);
  };
  console.log(wordsList);
  return {
    objects: wordsList,
    add,
    update: () => {
      wordsList.forEach((word) => {
        for (let i = 0; i < word.children.length; i++) {
          const letter = word.children[i];
          letter.position.copy(letter.body.position);
          letter.quaternion.copy(letter.body.quaternion);
        }
      });
    },
  };
};
