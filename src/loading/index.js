import EventListener from "utils/event.js";

export default async () => {
  const container = document.createElement("div");
  const eventListener = EventListener();

  return {
    attach: (parent) => parent.appendChild(container),
    start: () => {
      container.addEventListener("click", () => eventListener.emit);
      // return new Promise((resolve) => eventListener.on(resolve));
    },
    remove: () => container.remove(),
  };
};
