import Loading from "./loading/index.js";
import Chat from "./chat/chat.js";

const $ = (selector) => document.body.querySelector(selector);

async function main() {
  const loading = await Loading();
  loading.attach($("#app"));

  const game = await (await import("./game/index.js")).default();
  const chat = Chat(`hsl(${Math.random() * 360}, 100%, 80%)`);
  await loading.start();

  chat.attach($("#chat"));
  game.attach($("#app"), document.body);
  game.start();

  loading.remove();
}

document.body.requestFullscreen =
  document.body.requestFullscreen || document.body.webkitRequestFullScreen;

$("#app").addEventListener("click", function start() {
  $("#start").remove();
  if (location.hostname !== "localhost") document.body.requestFullscreen();
  main();
  $("#app").removeEventListener("click", start);
});
