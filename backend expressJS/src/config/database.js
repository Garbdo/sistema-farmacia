"use strict";

const mysql = require("mysql2/promise");
const { db } = require("./env");

// Creamos el pool directamente sin bloqueos síncronos pesados
const pool = mysql.createPool({
  host: db.host,
  port: Number(db.port) || 23864,
  user: db.user,
  password: db.pass,
  database: db.name,
  charset: db.charset,
  dateStrings: true,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  console.log("-> Intentando conectar a MySQL en:", db.host, "puerto:", db.port || 23864);
  try {
    const conn = await pool.getConnection();
    console.log("¡Conexión de prueba con MySQL establecida con éxito!");
    conn.release();
  } catch (err) {
    console.error("❌ ERROR CRÍTICO EN LA CONEXIÓN A MYSQL:");
    console.error(`- Mensaje: ${err.message}`);
    console.error(`- Código de error: ${err.code}`);
    console.error(`- Syscall: ${err.syscall}`);
    
    throw new Error(
      "Error de conexión con MySQL. Detalle: " + err.message,
      { cause: err },
    );
  }
}

module.exports = { pool, testConnection };