export default names => {
  let channels = [];
  const add = (name, peerId, peerChannel) => {
    channels.push({ name, peerId, peerChannel });
  };
  const remove = peerId =>
    (channels = channels.filter(channel => channel.peerId !== peerId));
  const makeCbDict = () =>
    names.reduce((prev, a) => Object.assign(prev, { [a]: [] }), {});
  const callbacksMessage = makeCbDict();
  const callbacksOpen = makeCbDict();
  return {
    setOut: (peerId, peer) => {
      names.forEach(name =>
        peer.createDataChannel(name).addEventListener("open", e => {
          add(name, peerId, e.target);
          callbacksOpen[name].forEach(cb => cb());
        })
      );
    },
    setIn: (peerId, peer) => {
      peer.addEventListener(
        "iceconnectionstatechange",
        () => peer.iceConnectionState === "disconnected" && remove(peerId)
      );
      peer.addEventListener("datachannel", ({ channel }) => {
        channel.addEventListener("message", e => {
          names.forEach(name => {
            if (channel.label === name) {
              callbacksMessage[name].forEach(cb => cb(JSON.parse(e.data)));
            }
          });
        });
      });
    },
    onOpen: (name, cb) => callbacksOpen[name].push(cb),
    onMessage: (name, cb) => callbacksMessage[name].push(cb),
    send: (name, message) =>
      channels
        .filter(channel => channel.name === name)
        .forEach(channel => {
          channel.peerChannel.send(JSON.stringify(message));
        })
  };
};
