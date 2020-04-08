// Helper to group access/trigger values of entities
export default (entities) => {
  const helper = (fn) =>
    Object.values(entities)
      .flatMap((e) => fn(e.manager))
      .filter((r) => r);

  return {
    helper,
    resize: () => helper((m) => m.resize && m.resize()),
    update: (deltaT) => helper((m) => m.update && m.update(deltaT)),
    start: () => helper((m) => m.start && m.start()),
    eventsCallbacks: (type) => (event) =>
      helper((m) => {
        if (m.keyEvents && m.keyEvents[type]) m.keyEvents[type](event);
      }),
    get events() {
      return helper((m) => m.keyEvents && Object.keys(m.keyEvents));
    },
    get objects() {
      return helper((m) => m.objects && m.objects.map((object) => object.mesh));
    },
    get bodies() {
      return helper((m) => m.objects && m.objects.map((object) => object.body));
    },
  };
};
