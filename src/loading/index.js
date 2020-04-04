import EventListener from "utils/event.js";

const id = "loading";
Object.assign(document.head.appendChild(document.createElement("style")), {
  innerHTML: `
    #${id} {
      width: 100%;
      height: 100%;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
});

export default async () => {
  const container = Object.assign(document.createElement("div"), { id });
  const content = Object.assign(document.createElement("div"), { innerText: "Loading..." });
  const eventListener = EventListener();

  container.appendChild(content);
  return {
    attach: (parent) => parent.appendChild(container),
    start: () => {
      container.addEventListener("click", () => eventListener.emit());
      setTimeout(eventListener.emit, 1000);
      return new Promise((resolve) => eventListener.on(resolve));
    },
    remove: () => container.remove(),
  };
};
