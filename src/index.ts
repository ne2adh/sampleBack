import express from "express";
import cors from "cors";
import http from "http"; 
import { Server } from "socket.io";
import router, { getTasksByDateRange } from "./routes";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// Inyectar socket.io en la app para accederlo en tasks.ts
app.set("socketio", io);

// Agregar rutas principales y de tareas
app.use(router);

// Manejo de WebSockets
io.on("connection", (socket) => {
  console.log("Usuario conectado");

  // Enviar todas las tareas actuales al conectar
	socket.on('get:tasks', async ({ from, to }) => {
		const tasks = await getTasksByDateRange(from, to);
		io.emit('load:tasks', tasks);
	});

  // 🔹 Escuchar cambios en las tareas
  socket.on("task_created", (data) => {
    io.emit("task_created", data);
  });

  socket.on("task_updated", (data) => {
    io.emit("task_updated", data);
  });

  socket.on("task_deleted", (data) => {
    io.emit("task_deleted", data);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});