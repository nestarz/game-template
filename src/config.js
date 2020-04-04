export default {
  SOCKET_URL:
    location.hostname === "localhost"
      ? "http://localhost:3000/"
      : "wss://db.eliasrhouzlane.com/",
  RTC_CONFIGURATION: {
    iceServers: [
      // { urls: "stun:stun.l.google.com:19302" },
      {
        urls: [
          "stun:51.77.212.160:3478",
          "turn:51.77.212.160:3478?transport=tcp"
        ],
        username: "elias",
        credential: "master2019dae"
      }
    ]
  }
};
