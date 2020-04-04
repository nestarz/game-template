import testIceServers from "./test.js";

let log_verbose = 0;
export const log = (...args) => {
  if (log_verbose) {
    const div = document.createElement("div");
    div.innerText = args.join(", ");
    document.body.appendChild(div);
    console.log(...args);
  }
};

async function iceGathering(socket, peerConnection, peer_id) {
  peerConnection.addEventListener("icecandidate", event => {
    if (event.candidate) {
      socket.emit("signal", {
        signal: { iceCandidate: event.candidate },
        id: peer_id
      });
    }
  });
  socket.on("signal", async ({ signal: message, id }) => {
    if (id === peer_id && message.iceCandidate) {
      peerConnection.addIceCandidate(new RTCIceCandidate(message.iceCandidate));
    }
  });
}

async function makeCall(webRTCconfig, socket, peer_id, fn) {
  const peerConnection = new RTCPeerConnection(webRTCconfig);
  peerConnection.oniceconnectionstatechange = () =>
    log("iceconnectionstatechange", peerConnection.iceConnectionState);

  await fn(peerConnection);
  iceGathering(socket, peerConnection, peer_id);

  socket.on("signal", async ({ signal: { answer }, id }) => {
    if (answer && id === peer_id) {
      log(`[Initiator] Receiving signal from the other peer ${id}`, answer);
      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(remoteDesc);
    }
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  log(`[Initiator] Sending signal to the other peer ${peer_id}`, offer);
  socket.emit("signal", { signal: { offer }, id: peer_id });

  return peerConnection;
}

async function receiveCall(webRTCconfig, socket, fn) {
  socket.on("signal", async ({ signal: message, id }) => {
    if (message.offer) {
      const peerConnection = new RTCPeerConnection(webRTCconfig);
      await new Promise((resolve, reject) => {
        fn({
          id,
          message,
          accept: () => {
            resolve();
            return peerConnection;
          },
          reject
        });
      });

      peerConnection.oniceconnectionstatechange = () =>
        log("iceconnectionstatechange", peerConnection.iceConnectionState);
      iceGathering(socket, peerConnection, id);
      log(`Receiving signal (offer) from the other peer ${id}`, message.offer);
      peerConnection.setRemoteDescription(
        new RTCSessionDescription(message.offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      log(`Sending signal (answer) to the other peer ${id}`, answer);
      socket.emit("signal", { signal: { answer: answer }, id });
    }
  });
}

const webRTCconfig_default = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default (socket, webRTCconfig = webRTCconfig_default, config = {}) => {
  log_verbose = config.verbose;
  // testIceServers(webRTCconfig);
  let conn;
  const connections = [];
  return {
    discover: data => socket.emit("discover-query", data),
    onDiscover: fn =>
      socket.on("discover-results", peers => {
        // console.log(peers)
        fn(peers.filter(peer => !connections.includes(peer)));
      }),
    connect: async (to, fn) => {
      conn = true;
      if (!connections.includes(to)) {
        connections.push(to);
        return await makeCall(webRTCconfig, socket, to, fn);
      }
    },
    onRequest: async fn => {
      if (conn) return;
      receiveCall(webRTCconfig, socket, fn);
    }
  };
};
