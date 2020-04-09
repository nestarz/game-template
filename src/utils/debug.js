const container = document.body.appendChild(document.createElement("div"));
Object.assign(container.style, {
  position: "fixed",
  top: "1rem",
  right: "1rem",
  zIndex: 1000,
  width: "25em",
  wordWrap: "break-word",
  textAlign: "right",
});

const createNode = (id) =>
  container.querySelector(`#${id}`) ||
  container.appendChild(Object.assign(document.createElement("span"), { id }));

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

let i = 0;
export const log = (id, ...value) => {
  i = (i + 10) % 360;
  if (!(typeof id === "string" || id instanceof String))
    throw Error("log must have string id");
  const node = createNode(id);
  node.innerHTML = `<div><div style="color: hsl(${i}, 80%, 80%)">ID: ${id}</div>${JSON.stringify(
    value,
    getCircularReplacer()
  )}</div>`;
};
