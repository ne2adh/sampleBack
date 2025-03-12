"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("./config");
const router = (0, express_1.Router)();
const handleDatabaseError = (error, res) => {
    console.error("Database error:", error);
    res.status(503).json({ success: false, message: "Error en la base de datos" });
};
router.get("/rows", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fecha } = req.query;
        if (!fecha) {
            res.status(400).json({ success: false, message: "El parámetro 'fecha' es requerido" });
        }
        const [rows] = yield config_1.pool.query("SELECT * FROM tasks WHERE DATE(fecha) = ?", [fecha]);
        if (Array.isArray(rows)) {
            const formattedRows = rows.map((row) => (Object.assign(Object.assign({}, row), { fecha: new Date(row.fecha).toISOString().split('T')[0] })));
            res.json({ success: true, data: formattedRows });
        }
        else {
            console.error("Error: rows no es un array", rows);
        }
    }
    catch (error) {
        handleDatabaseError(error, res);
    }
}));
// Guardar o actualizar fila
router.post("/rows", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew } = req.body;
        if (!fecha || !responsable || !titulo || !hora || !lugar) {
            res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
        }
        if (id && !isNew) {
            yield config_1.pool.query("UPDATE tasks SET fecha = ?, responsable = ?, institucion = ?, titulo = ?, hora = ?, lugar = ?, isEditing = ?, isNew = ? WHERE id = ?", [fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew, id]);
        }
        else {
            yield config_1.pool.query("INSERT INTO tasks (id, fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, fecha, responsable, institucion, titulo, hora, lugar, isEditing, isNew]);
        }
        res.json({ success: true, message: "Operación exitosa" });
    }
    catch (error) {
        handleDatabaseError(error, res);
    }
}));
// Eliminar fila
router.delete("/rows/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: "El ID es requerido" });
        }
        yield config_1.pool.query("DELETE FROM tasks WHERE id = ?", [id]);
        res.json({ success: true, message: "Fila eliminada correctamente" });
    }
    catch (error) {
        handleDatabaseError(error, res);
    }
}));
// Ruta para iniciar sesión o registrar usuario
// Ruta para iniciar sesión o registrar usuario
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        if (!username) {
            res.status(400).json({ error: "El username es requerido" });
        }
        // Verificar si el usuario existe
        const [rows] = yield config_1.pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) {
            yield config_1.pool.query("INSERT INTO users (username, isEditing, isOnline) VALUES (?, false, true)", [username]);
        }
        else {
            yield config_1.pool.query("UPDATE users SET isOnline = true WHERE username = ?", [username]);
        }
        const [user] = yield config_1.pool.query("SELECT * FROM users WHERE username = ?", [username]);
        // Emitir evento de actualización
        const io = req.app.get("socketio");
        io.emit("update_users");
        res.json({ success: true, user: user[0] });
    }
    catch (error) {
        handleDatabaseError(error, res);
    }
}));
// Ruta para cerrar sesión
router.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        if (!username) {
            res.status(400).json({ error: "El username es requerido" });
        }
        yield config_1.pool.query("UPDATE users SET isOnline = false WHERE username = ?", [username]);
        // Emitir evento de actualización
        const io = req.app.get("socketio");
        io.emit("update_users");
        res.json({ success: true, message: "Usuario deslogueado" });
    }
    catch (error) {
        handleDatabaseError(error, res);
    }
}));
// Ruta para actualizar estado de edición del usuario
router.post("/update-editing", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, isEditing } = req.body;
    if (!username)
        res.status(400).json({ error: "El username es requerido" });
    try {
        yield config_1.pool.query("UPDATE users SET isEditing = ? WHERE username = ?", [isEditing, username]);
        // Emitir evento a los clientes conectados para actualizar la lista de usuarios
        const io = req.app.get("socketio");
        io.emit("update_users");
        res.sendStatus(200);
    }
    catch (error) {
        console.log("🚀 ~ router.post ~ error:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}));
// Ruta para obtener los usuarios conectados y en edición
router.get("/usuarios", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [users] = yield config_1.pool.query("SELECT * FROM users WHERE isOnline = true");
        res.json({ success: true, data: users });
    }
    catch (error) {
        handleDatabaseError(error, res);
    }
}));
exports.default = router;
//# sourceMappingURL=routes.js.map