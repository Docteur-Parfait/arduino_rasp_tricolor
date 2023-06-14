const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

// Création de l'application Express
const app = express();
const server = http.createServer(app);

// Configuration de Socket.IO
const io = socketIO(server);

const IP_ADRESS = "192.168.0.106";

const port = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});

// Définir le dossier public comme ressource statique
app.use(express.static(path.join(__dirname, "public")));

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

parser.on("data", (line) => console.log(line));

// Open errors will be emitted as an error event
port.on("error", function (err) {
  console.log("Error: ", err.message);
});

// Gestion de la connexion d'un client Socket.IO
io.on("connection", (socket) => {
  console.log("Un client est connecté.");

  // Gestion des événements reçus depuis le client
  socket.on("led", (data) => {
    console.log("Événement LED reçu:", data);
    // Transfert de l'événement à la carte Arduino via le port série
    port.write(data.toString());
  });

  // Gestion de la déconnexion d'un client Socket.IO
  socket.on("disconnect", () => {
    console.log("Un client est déconnecté.");
  });
});

// Démarrage du serveur
server.listen(3000, IP_ADRESS, () => {
  console.log("Le serveur est en écoute sur le port 3000.");
});
