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
      res.json({ success: false, message: "El parámetro 'fecha' es requerido" });
    }
    const [rows] = await pool.query("SELECT * FROM tasks WHERE DATE(fecha) = ?", [fecha]);
    
    if (Array.isArray(rows)) {
      const formattedRows = rows.map((row: any )=> ({
        ...row,
        fecha: new Date(row.fecha).toISOString().split('T')[0], // Extrae solo la fecha YYYY-MM-DD
      }));
      res.json({ success: true, data: formattedRows });
    } else {
      console.error("Error: rows no es un array", rows);
      res.json({ success: false, message: "Error: rows no es un array" });
    }
    
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Guardar o actualizar fila
router.post("/rows", async (req, res) => {
  try {
    const { id, fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew } = req.body;
    if (!fecha || !responsable || !titulo || !hora || !lugar) {
      res.json({ success: false, message: "Faltan campos obligatorios" });
    } else{
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
        const io: Server = req.app.get("socketio");
        io.emit("update", fecha);        
        res.json({ success: true, message: "Operación exitosa" });
    }
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Eliminar fila
router.delete("/rows/:id/:c", async (req, res) => {
  try {
    const { id, c } = req.params;
    if (!id) {
      res.json({ success: false, message: "El ID es requerido" });
    }
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    const io: Server = req.app.get("socketio");
	io.emit("update", c);
    console.log("Fila eliminada correctamente");

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
		res.json({ success: false,  message: "El username es requerido" });
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
		res.json({ success: false,  message: "El username es requerido" });
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

router.get("/taskEditing", async (req, res) => {
    try {
      const [tasks] = await pool.query("SELECT * FROM tasks WHERE isEditing = true OR isNew = true");
      res.json({ success: true, data: tasks });
    } catch (error) {
      console.error("Error al obtener tareas en edición:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
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

