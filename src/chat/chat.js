import EventListener from "utils/event.js";

const id = "chat";
Object.assign(document.head.appendChild(document.createElement("style")), {
  innerHTML: `
  #${id} {
    display: grid;
    grid-gap: 0.25rem;
  }

  #${id} form {
    display: flex;
  }

  #${id} {
    display: grid;
    grid-gap: 1rem;
    grid-auto-rows: min-content;
  }

  #${id} input:first-child {
    margin-right: 0.25rem;
  }

  #${id} input:nth-child(2) {
    flex: 1;
  }

  #${id} button {
    margin-left: auto;
  }

  #${id} div {
    background: #00000047;
    color: white;
    font-family: "Times New Roman", Times, serif;
    width: 100%;
    font-size: 0.9rem;
    max-width: 20rem;
    display: grid;
    grid-template-columns: 5fr 10fr;
    grid-gap: 0.25rem;
  }

  #${id} span:not(:first-child),
  #${id} span:not(:nth-child(2)) {
    border-top: 1px solid #00000047;
    padding-top: 0.07rem;
    padding-bottom: 0.2rem;
  }

  #${id} span:nth-child(2n + 1) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`,
});

export default (color) => {
  const callbacks = [];
  const messageListener = EventListener();

  const chat = Object.assign(document.createElement("div"), { id });
  const form = Object.assign(document.createElement("form"), {
    action: "#",
  });
  const log = document.createElement("div");
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
    spans.forEach((node) => log.appendChild(node));
    messageListener.emit(pseudo, text, color, ...args);
  };

  form.addEventListener("submit", (event) => {
    newMessage(pseudo.value, message.value, color);
    callbacks.forEach((cb) => cb(pseudo.value, message.value));
    event.preventDefault();
    message.value = "";
    pseudo.setAttribute("disabled", true);
  });

  form.append(pseudo, message, submit);
  chat.append(form, log);
  return {
    attach: (parent) => parent.appendChild(chat),
    newMessage,
    onMessage: messageListener.on,
    onSubmit: (fn) => {
      callbacks.push(fn);
    },
  };
};
