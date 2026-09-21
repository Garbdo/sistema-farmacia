"use strict";

const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

const listarUsuarios = async (req, res, next) => {
  try {
    const [roles] = await pool.query("SELECT * FROM roles ORDER BY id");
    const [rows] = await pool.query(
      "SELECT u.id, u.nombre, u.usuario, u.rol_id, u.activo, r.nombre rol FROM usuarios u JOIN roles r ON r.id=u.rol_id ORDER BY u.id DESC"
    );
    res.json({ ok: true, roles, usuarios: rows });
  } catch (error) {
    next(error);
  }
};

const obtenerUsuario = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT u.id, u.nombre, u.usuario, u.rol_id, u.activo, r.nombre rol FROM usuarios u JOIN roles r ON r.id=u.rol_id WHERE u.id=?",
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    res.json({ ok: true, usuario: rows[0] });
  } catch (error) {
    next(error);
  }
};

const guardarUsuario = async (req, res, next) => {
  try {
    const id = parseInt(req.body.id || 0);
    const rol = parseInt(req.body.rol_id);
    const nombre = (req.body.nombre || "").trim();
    const usuario = (req.body.usuario || "").trim();
    const password = req.body.password || "";
    const activo =
      req.body.activo !== undefined &&
      req.body.activo !== false &&
      req.body.activo !== "0"
        ? 1
        : 0;

    if (!nombre || !usuario || !rol) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre, usuario y rol son obligatorios."
      });
    }

    const [roleRows] = await pool.query(
      "SELECT id FROM roles WHERE id=? LIMIT 1",
      [rol]
    );

    if (!roleRows[0]) {
      return res.status(400).json({
        ok: false,
        mensaje: "El rol seleccionado no existe."
      });
    }

    if (id) {
      const [existing] = await pool.query(
        "SELECT id FROM usuarios WHERE usuario=? AND id<>? LIMIT 1",
        [usuario, id]
      );

      if (existing[0]) {
        return res.status(400).json({
          ok: false,
          mensaje: "Ese nombre de usuario ya está registrado."
        });
      }

      await pool.query(
        "UPDATE usuarios SET nombre=?, usuario=?, rol_id=?, activo=? WHERE id=?",
        [nombre, usuario, rol, activo, id]
      );

      if (password.trim()) {
        const hash = bcrypt.hashSync(password, 12);
        await pool.query(
          "UPDATE usuarios SET password=? WHERE id=?",
          [hash, id]
        );
      }

      return res.json({ ok: true, mensaje: "Usuario actualizado." });
    }

    if (!password.trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: "La contraseña es obligatoria para crear un usuario."
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM usuarios WHERE usuario=? LIMIT 1",
      [usuario]
    );

    if (existing[0]) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ese nombre de usuario ya está registrado."
      });
    }

    const hash = bcrypt.hashSync(password, 12);

    await pool.query(
      "INSERT INTO usuarios(nombre, usuario, password, rol_id, activo) VALUES(?, ?, ?, ?, ?)",
      [nombre, usuario, hash, rol, activo]
    );

    res.json({ ok: true, mensaje: "Usuario creado." });
  } catch (error) {
    next(error);
  }
};

const toggleUsuario = async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE usuarios SET activo=1-activo WHERE id=?",
      [parseInt(req.params.id)]
    );

    res.json({ ok: true, mensaje: "Estado modificado." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  guardarUsuario,
  toggleUsuario
};
