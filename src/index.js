import Loading from "./loading/index.js";
import Chat from "./chat/chat.js";

const $ = (selector) => document.body.querySelector(selector);
const dev = location.hostname === "localhost";

async function main() {
  const overlay = $("#app").appendChild(document.createElement("aside"));
  const main = $("#app").appendChild(document.createElement("main"));

  const loading = await Loading();
  loading.attach(main);

  const game = await (await import("./game/index.js")).default();
  const chat = Chat(`hsl(${Math.random() * 360}, 100%, 80%)`);

  if (!dev) {
    await loading.start();
  }

  // chat.attach(overlay);
  game.attach(main, document.body);
  game.start();

  loading.remove();
}

document.body.requestFullscreen =
  document.body.requestFullscreen || document.body.webkitRequestFullScreen;

main();
