const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static(path.join(__dirname, 'javascript')));
app.use(express.static(path.join(__dirname, 'styles')));

// Agregar el middleware bodyParser para procesar los datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.post("/guardar-datos", function (req, res) {
  const { nombre, latitud, longitud } = req.body;
  const url = `/mapa.html?nombre=${nombre}&latitud=${latitud}&longitud=${longitud}`;
  res.redirect(url);
});

app.get("/mapa.html", function (request, response) {
    response.sendFile(path.join(__dirname + "/views/mapa.html"))
});

app.listen(3000, function() {
  console.log("Servidor corriendo en el puerto 3000");
});
