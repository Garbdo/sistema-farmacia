"use strict";

const express = require('express'); 
const path = require('path');        

const app = require("./src/app");
const env = require("./src/config/env");
const { testConnection } = require("./src/config/database");
const { iniciarJobAlertas } = require("./src/jobs/alertas.job");

// Cloud Run asigna el puerto automáticamente, por defecto 8080
const PORT = process.env.PORT || 8080;

async function iniciarServidor() {
  try {
    await testConnection();
    console.log("Conexión exitosa a la base de datos.");

    iniciarJobAlertas();
    console.log("Job de alertas (FEFO/Stock) activado.");

    // Servir la carpeta public desde la raíz (donde está index.js)
    app.use(express.static(path.join(__dirname, 'public')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Escuchar en '0.0.0.0' y en el puerto dinámico de Cloud Run
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\nServidor Express corriendo en el puerto ${PORT}`);
      console.log(`Catálogo disponible en http://localhost:${PORT}/api/catalogo`);
    });
  } catch (error) {
    console.error("Fallo crítico al iniciar el servidor:");
    console.error(error.message);
    process.exit(1);
  }
}

iniciarServidor();