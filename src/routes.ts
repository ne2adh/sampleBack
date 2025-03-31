import { Router } from "express";
import { pool } from "./config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const SECRET_KEY = "gobierno-autonomo-oruro"; // Cambiar por variable de entorno

// Manejo mejorado de errores de base de datos
const handleDatabaseError = (error: any, res: any) => {
	console.error("Database Error:", error);

	if (error.code === "ER_DUP_ENTRY") {
		return res.status(409).json({ message: "El registro ya existe" });
	}
	if (error.code === "ER_BAD_FIELD_ERROR") {
		return res.status(400).json({ message: "Campo inválido en la solicitud" });
	}
	if (error.code === "ER_NO_REFERENCED_ROW" || error.code === "ER_NO_REFERENCED_ROW_2") {
		return res.status(400).json({ message: "Clave foránea no válida" });
	}

	return res.status(500).json({ message: "Error interno del servidor" });
};

// Login endpoint
router.post("/login", async (req: any, res: any) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ message: "Usuario y contraseña requeridos" });
	}

	try {
		const [rows]: any = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
		if (!rows.length) {
			return res.status(404).json({ message: "Usuario no encontrado" });
		}

		const user = rows[0];
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ message: "Contraseña incorrecta" });
		}

		const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
		res.json({ token, user: { id: user.id, username: user.username } });
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

// CRUD de usuarios
router.post("/users", async (req: any, res: any) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ message: "Usuario y contraseña requeridos" });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	try {
		await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
		res.status(201).json({ message: "Usuario creado exitosamente" });
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

router.get("/users/:id", async (req: any, res: any) => {
	const { id } = req.params;
	try {
		const [rows]: any = await pool.query("SELECT id, username FROM users WHERE id = ?", [id]);
		if (!rows.length) {
			return res.status(404).json({ message: "Usuario no encontrado" });
		}
		res.json(rows[0]);
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

router.put("/users/:id", async (req, res) => {
	const { id } = req.params;
	const { username, password } = req.body;
	const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

	try {
		await pool.query("UPDATE users SET username = ?, password = COALESCE(?, password) WHERE id = ?", [username, hashedPassword, id]);
		res.json({ message: "Usuario actualizado" });
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

router.delete("/users/:id", async (req, res) => {
	const { id } = req.params;
	try {
		await pool.query("DELETE FROM users WHERE id = ?", [id]);
		res.json({ message: "Usuario eliminado" });
	} catch (error) {
		handleDatabaseError(error, res);
	}
});



// Crear una nueva tarea
router.post("/tasks", async (req: any, res: any) => {
	const { fecha, solicitante, institucion, titulo, hora, responsable, user_id } = req.body;
	const io = req.app.get("socketio");
	console.log("🚀 ~ router.post ~ user_id:", user_id)

	if (!fecha || !solicitante || !institucion || !titulo || !hora || !responsable || !user_id) {
		res.status(400).json({ message: "Todos los campos son requeridos" });
	}

	try {
		const [result]: any = await pool.query(
			`INSERT INTO tasks (id, fecha, solicitante, institucion, titulo, hora, responsable, estado, user_id)
			 VALUES (UUID(), ?, ?, ?, ?, ?, ?, false, ?)`,
			[fecha, solicitante, institucion, titulo, hora, responsable, false, user_id]
		);
		
		console.log("🚀 ~ router.post ~ result:", result)

		const newTaskId = result.insertId;
		io.emit("task_created", { id: newTaskId, fecha, solicitante, institucion, titulo, hora, responsable });

		res.status(201).json({ message: "Tarea creada exitosamente" });
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

// Obtener todas las tareas
router.get("/tasks", async (req, res) => {
	//const io = req.app.get("socketio");
	try {		
		const [rows]: any = await pool.query("SELECT * FROM tasks");
		//io.emit('load:tasks', rows);
		res.json(rows);
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

// Obtener una tarea por ID
router.get("/tasks/:id", async (req: any, res: any) => {
	const { id } = req.params;
	try {
		const [rows]: any = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);

		if (!rows.length) {
			return res.status(404).json({ message: "Tarea no encontrada" });
		}

		res.json(rows[0]);
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

// Actualizar una tarea
router.put("/tasks/:id", async (req, res) => {
	const { id } = req.params;
	const { fecha, solicitante, institucion, titulo, hora, responsable, estado } = req.body;
	const io = req.app.get("socketio");

	try {
		await pool.query(
			`UPDATE tasks SET fecha = ?, solicitante = ?, institucion = ?, titulo = ?, hora = ?, responsable, estado = ?,  
			  WHERE id = ?`,
			[fecha, solicitante, institucion, titulo, hora, responsable, estado, estado, id]
		);

		io.emit("task_updated", { id, fecha, solicitante, institucion, titulo, hora, responsable, estado });

		res.json({ message: "Tarea actualizada" });
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

// Eliminar una tarea
router.delete("/tasks/:id", async (req, res) => {
	const { id } = req.params;
	const io = req.app.get("socketio");

	try {
		await pool.query("DELETE FROM tasks WHERE id = ?", [id]);

		io.emit("task_deleted", { id });

		res.json({ message: "Tarea eliminada" });
	} catch (error) {
		handleDatabaseError(error, res);
	}
});

router.post("/logout", (req: any, res: any) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return res.status(400).json({ message: "Token requerido para cerrar sesión" });
	}

	try {
		// Verifica si el token es válido
		const decoded = jwt.verify(token, SECRET_KEY);
		console.log("🚀 ~ router.post ~ decoded:", decoded)
		
		res.json({ message: "Sesión cerrada exitosamente" });
	} catch (error) {
		return res.status(401).json({ message: "Token inválido o expirado" });
	}
});

export const getTasksByDateRange = async (from: string, to: string) => {
	const [rows] = await pool.query("SELECT * FROM tasks WHERE fecha BETWEEN ? AND ?", [from, to]);
	if (Array.isArray(rows)) {
		const formattedRows = rows.map((row: any )=> ({
		  ...row,
		  fecha: new Date(row.fecha).toISOString().split('T')[0], // Extrae solo la fecha YYYY-MM-DD
		}));		
		return formattedRows;
	  } else {
		console.error("Error: rows no es un array", rows);
		return [];
	}
};

export const getsaveTasks = async (data: any) => {
	const { fecha, solicitante, institucion, titulo, hora, responsable, user_id } = data;
	
	const taskId = crypto.randomUUID();

	const [result]: any = await pool.query(
		`INSERT INTO tasks (id, fecha, solicitante, institucion, titulo, hora, responsable, estado, user_id)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[taskId, fecha, solicitante, institucion, titulo, hora, responsable, false, user_id]
	);
	
	const [row] : any = await pool.query("SELECT * FROM tasks WHERE id = ?", [taskId]);
	if (row) {		
		const formattedRows = { ...row[0], fecha: new Date(row[0].fecha).toISOString().split('T')[0] };
		return formattedRows;
	  } else {
		console.error("Error: rows no es un array", row);
		return [];
	}
}

export default router;
