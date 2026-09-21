"use strict";

const express = require('express'); 
const path = require('path');        

const app = require("./src/app");
const env = require("./src/config/env");
const { testConnection } = require("./src/config/database");
const { iniciarJobAlertas } = require("./src/jobs/alertas.job");

const PORT = process.env.PORT || 8080;

// 1. Configurar archivos estáticos de Angular inmediatamente
app.use(express.static(path.join(__dirname, 'public')));
    
// Usar expresión regular compatible con Express moderno para el comodín de Angular
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. LEVANTAR EL SERVIDOR DE INMEDIATO (Esto evita que Cloud Run falle por timeout)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nServidor Express corriendo en el puerto ${PORT}`);
});

// 3. Conectar a la base de datos y jobs en segundo plano
async function iniciarServiciosSecundarios() {
  try {
    await testConnection();
    console.log("Conexión exitosa a la base de datos.");

    iniciarJobAlertas();
    console.log("Job de alertas (FEFO/Stock) activado.");
  } catch (error) {
    console.error("Advertencia de base de datos al iniciar:");
    console.error(error.message);
  }
}

iniciarServiciosSecundarios();