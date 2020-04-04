var corsOptions = {
  origin: "http://localhost:5000/",
  optionsSuccessStatus: 204
};

const cors = require("cors");
var corsMiddleware = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "localhost"); //replace localhost with actual host
  res.header(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, PUT, PATCH, POST, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Requested-With, Authorization"
  );

  next();
};

const app = require("express")()
  .use(cors(corsOptions))
  .use(corsMiddleware);
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const Signal = io => {
  const connection = socket => {
    socket.on("signal", data => {
      const peer_socket = io.sockets.connected[data.id];
      if (peer_socket)
        peer_socket.emit("signal", {
          signal: data.signal,
          id: socket.id
        });
    });

    socket.on("discover-query", () => {
      const ids = Object.values(io.sockets.connected)
        .filter(curr => curr.id !== socket.id)
        .map(socket => socket.id);
      socket.emit("discover-results", ids);
    });
  };

  return {
    start: () => {
      io.on("connection", connection);
      io.on("connection", socket => socket.emit("connected", socket.id));
    }
  };
};

Signal(io).start();
http.listen(3000);
