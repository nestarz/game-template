import * as THREE from "three";

import Physics from "./physics/physics.js";
import Scene from "./environnement/scene.js";
import { Player } from "./player/players.js";
import { TPSCameraControl } from "./player/tpsCameraControl.js";

const FPS = 24;
const FOV = 90;

export default async () => {
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 10000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio / 3);

  // Functions that return an object with a 'manager' key 
  // with update, keyEvents, start, resize methods
  // and an objects list to add to the scene (can be updated)

  const scene = await Scene(camera, renderer);
  const physics = await Physics(scene.scene, 1 / FPS, { debug: true });
  const control = await TPSCameraControl(camera);
  const player = await Player(physics.world, control);

  const entities = { scene, physics, control, player };

  // Helper to access manager values
  const manager = (fn) =>
    Object.values(entities)
      .flatMap((e) => fn(e.manager))
      .filter((r) => r);

  return {
    attach: async (element, listener = element) => {
      element.appendChild(renderer.domElement);

      const resize = () => manager((m) => m.resize && m.resize());
      if (window.ResizeObserver)
        new window.ResizeObserver(resize).observe(element);
      else window.addEventListener("resize", resize);

      const keyEvents = (ev) =>
        manager(({ keyEvents }) => {
          if (keyEvents && keyEvents[ev.type]) keyEvents[ev.type](ev);
        });
      manager((m) => m.keyEvents && Object.keys(m.keyEvents)).forEach((event) =>
        listener.addEventListener(event, keyEvents, true)
      );
    },
    start: () => {
      let i = 0;
      manager((m) => m.start && m.start());
      setTimeout(function update() {
        console.clear();
        manager((m) => m.update && m.update(i));
        scene.updateObjects(manager((m) => m.objects));
        i++;
        setTimeout(update, 1000 / FPS);
      }, 1000 / FPS);
    },
  };
};
