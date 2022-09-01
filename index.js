var chatbot = require("./controller/chatbot");
var dialogflowApi = require("./controller/dialogflow");
// Importar las dependencias para configurar el servidor
var express = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// configurar el puerto y el mensaje en caso de exito
app.listen((process.env.PORT || 5000), () => console.log('El servidor webhook esta escuchando!'));

// Ruta de la pagina index
app.get("/", (req, res)=> chatbot.index(req, res));

// Facebook Webhook

// Usados para la verificacion
app.get("/webhook", (req, res)=> chatbot.verification(req, res));

// Todos eventos de mesenger seran capturados por esta ruta
app.post("/webhook", (req, res)=> chatbot.responseHandler(req, res));

app.post("/dialogflow/send", async (req, res)  => dialogflowApi.sendText(req,res));


