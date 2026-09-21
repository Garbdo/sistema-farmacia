"use strict";

const mysql = require("mysql2/promise");
const { db } = require("./env");

console.log("Configurando pool de conexiones MySQL...");
console.log(`-> Host detectado: ${db.host}`);
console.log(`-> Puerto detectado: ${db.port || 23864}`);
console.log(`-> Usuario detectado: ${db.user}`);
console.log(`-> Base de datos: ${db.name}`);

const pool = mysql.createPool({
  host: db.host,
  port: Number(db.port) || 23864, // Forzamos el puerto de Aiven por si env.js no lo lee
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
  try {
    console.log("Intentando obtener conexión de prueba desde el pool hacia MySQL...");
    const conn = await pool.getConnection();
    console.log("¡Conexión de prueba con MySQL establecida con éxito!");
    conn.release();
  } catch (err) {
    console.error("❌ ERROR CRÍTICO EN LA CONEXIÓN A MYSQL:");
    console.error(`- Mensaje: ${err.message}`);
    console.error(`- Código de error: ${err.code}`);
    console.error(`- Syscall: ${err.syscall}`);
    
    throw new Error(
      "Error de conexión con MySQL. Verifica que las credenciales de Aiven sean correctas y que el puerto esté abierto. Detalle: " +
        err.message,
      { cause: err },
    );
  }
}

module.exports = { pool, testConnection };"use strict";

const mysql = require("mysql2/promise");
const { db } = require("./env");

console.log("Configurando pool de conexiones MySQL...");
console.log(`-> Host detectado: ${db.host}`);
console.log(`-> Puerto detectado: ${db.port || 23864}`);
console.log(`-> Usuario detectado: ${db.user}`);
console.log(`-> Base de datos: ${db.name}`);

const pool = mysql.createPool({
  host: db.host,
  port: Number(db.port) || 23864, // Forzamos el puerto de Aiven por si env.js no lo lee
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
  try {
    console.log("Intentando obtener conexión de prueba desde el pool hacia MySQL...");
    const conn = await pool.getConnection();
    console.log("¡Conexión de prueba con MySQL establecida con éxito!");
    conn.release();
  } catch (err) {
    console.error("❌ ERROR CRÍTICO EN LA CONEXIÓN A MYSQL:");
    console.error(`- Mensaje: ${err.message}`);
    console.error(`- Código de error: ${err.code}`);
    console.error(`- Syscall: ${err.syscall}`);
    
    throw new Error(
      "Error de conexión con MySQL. Verifica que las credenciales de Aiven sean correctas y que el puerto esté abierto. Detalle: " +
        err.message,
      { cause: err },
    );
  }
}

module.exports = { pool, testConnection };