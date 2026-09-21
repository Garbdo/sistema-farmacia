"use strict";

const express = require('express'); // Asegúrate de tener esto importado si no lo tenías
const path = require('path');         // Asegúrate de tener esto importado si no lo tenías

const app = require("./src/app");
const env = require("./src/config/env");
const { testConnection } = require("./src/config/database");
const { iniciarJobAlertas } = require("./src/jobs/alertas.job");

const PORT = process.env.PORT || 3000;

// (Si ya tenías tu app.listen aquí o en iniciarServidor, déjalo tal cual)

async function iniciarServidor() {
  try {
    await testConnection();
    console.log("Conexión exitosa a la base de datos.");

    iniciarJobAlertas();
    console.log("Job de alertas (FEFO/Stock) activado.");

    // ==========================================
    // AGREGAR ESTO AQUÍ ABAJO (sin tocar nada de arriba)
    // ==========================================
    app.use(express.static(path.join(__dirname, '../public')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });
    // ==========================================

    app.listen(PORT, () => {
      console.log(`\nServidor Express corriendo en http://localhost:${PORT}`);
      console.log(`Catálogo disponible en http://localhost:${PORT}/api/catalogo`);
    });
  } catch (error) {
    console.error("Fallo crítico al iniciar el servidor:");
    console.error(error.message);
    process.exit(1);
  }
}

iniciarServidor();