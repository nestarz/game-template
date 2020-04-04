import EventListener from "utils/event.js";

export default (color) => {
  const callbacks = [];
  const messageListener = EventListener();

  const form = Object.assign(document.createElement("form"), { action: "#" });
  const chat = document.createElement("div");
  const pseudo = Object.assign(document.createElement("input"), {
    type: "text",
    placeholder: "Pseudo",
    required: true,
  });
  const message = Object.assign(document.createElement("input"), {
    type: "text",
    placeholder: "Message",
    required: true,
  });
  const submit = Object.assign(document.createElement("button"), {
    type: "submit",
  });

  const newMessage = (pseudo, text, color, ...args) => {
    const span = (innerText) =>
      Object.assign(document.createElement("span"), { innerText });
    const spans = [span(`[${pseudo}]`), span(text)];
    Object.assign(spans[0].style, { color });
    spans.forEach((node) => chat.appendChild(node));
    messageListener.emit(pseudo, text, color, ...args);
  };

  form.addEventListener("submit", (event) => {
    newMessage(pseudo.value, message.value, color);
    callbacks.forEach((cb) => cb(pseudo.value, message.value));
    event.preventDefault();
    message.value = "";
    pseudo.setAttribute("disabled", true);
  });

  form.append(pseudo, message, submit, chat);
  return {
    attach: (parent) => parent.appendChild(form),
    newMessage,
    onMessage: messageListener.on,
    onSubmit: (fn) => {
      callbacks.push(fn);
    },
  };
};
