import { Router } from "express";
import { pool } from "./config";
import { Server } from "socket.io";

const router = Router();


const handleDatabaseError = (error: any, res: any) => {
  console.error("Database error:", error);
  res.status(503).json({ success: false, message: "Error en la base de datos" });
};

router.get("/rows", async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      res.status(400).json({ success: false, message: "El parámetro 'fecha' es requerido" });
    }
    const [rows] = await pool.query("SELECT * FROM tasks WHERE DATE(fecha) = ?", [fecha]);
    res.json({ success: true, data: rows });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Guardar o actualizar fila
router.post("/rows", async (req, res) => {
  try {
    const { id, fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew } = req.body;
    if (!fecha || !responsable || !titulo || !hora || !lugar) {
      res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }
    if (id && !isNew) {
      await pool.query(
        "UPDATE tasks SET fecha = ?, responsable = ?, institucion = ?, titulo = ?, hora = ?, lugar = ?, isEditing = ?, isNew = ? WHERE id = ?",
        [fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew, id]
      );
    } else {
      await pool.query(
        "INSERT INTO tasks (id, fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew]
      );
    }
    res.json({ success: true, message: "Operación exitosa" });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Eliminar fila
router.delete("/rows/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "El ID es requerido" });
    }
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ success: true, message: "Fila eliminada correctamente" });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});


// Ruta para iniciar sesión o registrar usuario
// Ruta para iniciar sesión o registrar usuario
router.post("/login", async (req, res) => {
	try {
	  const { username } = req.body;
	  if (!username) {
		res.status(400).json({ error: "El username es requerido" });
	  }
  
	  // Verificar si el usuario existe
	  const [rows]: any = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
  
	  if (rows.length === 0) {
		await pool.query("INSERT INTO users (username, isEditing, isOnline) VALUES (?, false, true)", [username]);
	  } else {
		await pool.query("UPDATE users SET isOnline = true WHERE username = ?", [username]);
	  }
  
	  const [user]: any = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
  
	  // Emitir evento de actualización
	  const io: Server = req.app.get("socketio");
	  io.emit("update_users");
  
	  res.json({ success: true, user: user[0] });
	} catch (error) {
	  handleDatabaseError(error, res);
	}
});

// Ruta para cerrar sesión
router.post("/logout", async (req, res) => {
	try {
	  const { username } = req.body;
	  if (!username) {
		res.status(400).json({ error: "El username es requerido" });
	  }
  
	  await pool.query("UPDATE users SET isOnline = false WHERE username = ?", [username]);
  
	  // Emitir evento de actualización
	  const io: Server = req.app.get("socketio");
	  io.emit("update_users");
  
	  res.json({ success: true, message: "Usuario deslogueado" });
	} catch (error) {
	  handleDatabaseError(error, res);
	}
});

// Ruta para actualizar estado de edición del usuario
router.post("/update-editing", async (req, res) => {
    const { username, isEditing } = req.body;
    
    if (!username) res.status(400).json({ error: "El username es requerido" });

    try {
        await pool.query("UPDATE users SET isEditing = ? WHERE username = ?", [isEditing, username]);

        // Emitir evento a los clientes conectados para actualizar la lista de usuarios
        const io: Server = req.app.get("socketio");
        io.emit("update_users");		
        res.sendStatus(200);
    } catch (error: any) {
    	console.log("🚀 ~ router.post ~ error:", error)		
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Ruta para obtener los usuarios conectados y en edición
router.get("/usuarios", async (req, res) => {
	try {
	  const [users] = await pool.query("SELECT * FROM users WHERE isOnline = true");
	  res.json({ success: true, data: users });
	} catch (error) {
	  handleDatabaseError(error, res);
	}
});

export default router;

