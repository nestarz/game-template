import Loading from "./loading/index.js";
import Chat from "./chat/chat.js";

const $ = (selector) => document.body.querySelector(selector);

async function main() {
  const overlay = $("#app").appendChild(document.createElement("aside"));
  const main = $("#app").appendChild(document.createElement("main"));

  const loading = await Loading();
  loading.attach(main);

  const game = await (await import("./game/index.js")).default();
  const chat = Chat(`hsl(${Math.random() * 360}, 100%, 80%)`);
  // await loading.start();

  chat.attach(overlay);
  game.attach(main, document.body);
  game.start();

  loading.remove();
}

document.body.requestFullscreen =
  document.body.requestFullscreen || document.body.webkitRequestFullScreen;

const start = Object.assign(
  $("#app").appendChild(document.createElement("span")),
  { innerText: "Lancer" }
);
start.style.cursor = "pointer";

if (location.hostname !== "localhost") {
  $("#app").addEventListener("click", function go() {
    start.remove();
    if (location.hostname !== "localhost") document.body.requestFullscreen();
    main();
    $("#app").removeEventListener("click", go);
  });
} else {
  start.remove();
  main();
}