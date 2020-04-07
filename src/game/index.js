import Physics from "./physics/physics.js";
import Setup from "./environnement/scene.js";
import { Player } from "./player/players.js";
import { TPSCameraControl } from "./player/tpsCameraControl.js";

export default async () => {
  const FPS = 25;

  const setup = await Setup({ withControls: false });
  const physics = await Physics(setup.scene, 1 / FPS, { debug: true });
  const control = await TPSCameraControl(setup.camera);
  const player = await Player(physics.world, control);

  const entities = { setup, control, player, physics };
  const manager = (fn) =>
    Object.values(entities)
      .flatMap((e) => fn(e.manager))
      .filter((r) => r);

  return {
    attach: async (element, listener = element) => {
      element.appendChild(setup.renderer.domElement);

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
        manager((m) => m.update(i));
        setup.updateObjects(manager((m) => m.objects));
        i++;
        setTimeout(update, 1000 / FPS);
      }, 1000 / FPS);
    },
  };
};
