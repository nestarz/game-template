import { freeze } from "./safe.js";

// Helper to group access/trigger values of entities
export default (entities) => {
  const helper = (fn) =>
    Object.values(entities)
      .flatMap((e) => fn(freeze(e.manager)))
      .filter((r) => r);

  return {
    helper,
    resize: () => helper((m) => "resize" in m && m.resize()),
    update: (deltaT) => helper((m) => "update" in m && m.update(deltaT)),
    start: () => helper((m) => "start" in m && m.start()),
    eventsCallbacks: (type) => (event) =>
      helper((m) => {
        if ("keyEvents" in m && type in m.keyEvents) m.keyEvents[type](event);
      }),
    get events() {
      return helper((m) => "keyEvents" in m && Object.keys(m.keyEvents));
    },
    get objects() {
      return helper(
        (m) =>
          "objects" in m &&
          m.objects
            .map((object) => freeze(object))
            .filter((object) => "mesh" in object && object.mesh)
            .map((object) => {
              object.mesh.name = object.name;
              if ("body" in object) {
                object.mesh.body = object.body;
              }
              return object.mesh;
            })
      );
    },
    get bodies() {
      return helper(
        (m) =>
          "objects" in m &&
          m.objects
            .map((object) => freeze(object))
            .filter((object) => "body" in object && object.body)
            .map((object) => {
              object.body.name = object.name;
              if ("mesh" in object) {
                object.body.mesh = object.mesh;
              }
              return object.body;
            })
      );
    },
  };
};
