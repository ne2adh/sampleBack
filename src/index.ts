import express from "express";
import cors from "cors";
import http from "http"; 
import { Server } from "socket.io";
import router from "./routes";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());
app.use(router);

app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("update", () => {
    io.emit("update");
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
