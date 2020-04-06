import Physics from "./physics/physics.js";
import Setup from "./environnement/scene.js";
import { Player } from "./player/players.js";
// import { TPSControl } from "./player/tpsControl.js";
import { Orbit } from "./player/testControl.js";

export default async () => {
  const FPS = 25;

  const setup = await Setup({ withControls: false });
  const physics = await Physics(setup.scene, 1 / FPS, { debug: true });
  const control = await Orbit(setup.camera);
  const player = await Player(physics.world, setup.camera, control); //setup.controls);

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
        manager((m) => m.update(i));
        setup.updateObjects(manager((m) => m.objects));
        i++;
        setTimeout(update, 1000 / FPS);
      }, 1000 / FPS);
    },
  };
};
