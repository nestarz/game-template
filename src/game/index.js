import * as THREE from "three";

import Physics from "./physics/physics.js";
import Scene from "./environnement/scene.js";
import Field from "./environnement/field.js";
import Lights from "./environnement/lights.js";
import { Player } from "./player/player.js";
import { TPSCameraControl } from "./player/tpsCameraControl.js";

import Group from "./utils/group.js";

const FPS = 60;
const FOV = 45;

export default async () => {
  const renderer = new THREE.WebGLRenderer();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 2000);
  renderer.setPixelRatio(window.devicePixelRatio / 1);

  const control = await TPSCameraControl({ camera });
  const scene = await Scene({ camera, renderer });
  const physics = await Physics({ scene: scene.scene, fps: FPS, debug: true });
  const lights = await Lights();
  const field = await Field();
  const player = await Player();
  const group = Group({ scene, lights, control, player, field, physics });

  const offset = new THREE.Vector3(0, 15, 0);
  return {
    start: () => {
      let t = 0;
      group.start();
      setTimeout(function update() {
        group.update(t++);

        scene.updateObjects(group.objects);
        physics.updateBodies(group.bodies);

        control.setCollideObjects(group.objects);
        control.setTarget(player.position.add(offset));

        if (player.inUserMovement()) {
          control.setAzimuthIfNotDragging(player.spherical.theta);
        }

        setTimeout(update, 1000 / FPS);
      }, 1000 / FPS);
    },
    attach: async (element, listener = element) => {
      element.appendChild(renderer.domElement);

      if (window.ResizeObserver)
        new window.ResizeObserver(group.resize).observe(element);
      else window.addEventListener("resize", resize);

      group.events.forEach((type) =>
        listener.addEventListener(type, group.eventsCallbacks(type), true)
      );
    },
  };
};
