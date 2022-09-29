var chatbot = require("./controller/chatbot");
var dialogflowApi = require("./controller/dialogflow");
var mongodbApi = require("./controller/mongodb");
// Importar las dependencias para configurar el servidor
var express = require("express");
var bodyParser = require("body-parser");

// Tablas MongoDB
const Album = require("./Models/Album");

var app = express();

require('dotenv').config();
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

//  MongoDB
app.post("/mongodb/store", async (req, res) => mongodbApi.store(req,res));

// Modelos de MongoDB
app.post("/album", (req, res) => {
    let body = req.body;
    let album = new Album({
        name: body.name,
        artist: body.artist,
        presentation: body.presentation,
        date: body.date,
    });
    album.save((err, albumDB) => {
        if (err) return res.json({ ok: false, msg: "Error"});
        res.json({
            ok: true,
            msg: "Album creado correctamente",
            album: albumDB,
        });
    });
});

app.post("/exists", async (req, res) => {

    let body = req.body;
    console.log(JSON.stringify(body));

    let album = Album;

    let queryBody = {
        "name": body["queryResult"]["parameters"]["albumes"],
        "artist": body["queryResult"]["parameters"]["artista"],
        "presentation": body["queryResult"]["parameters"]["presentacion"]
    }

    let result = await album.findOne(queryBody);

    let itemExists = result != null;

    let fulfillmentText = itemExists ? "Si lo this.enemos disponible ¿deseas realizar un pedido?" : "Disculpa, pero no tenemos ese ejemplar disponible. Pero si así lo desea, puede proporcionarnos sus datos para que le notifiquemos cuando el ejemplar que desea vuelva a estar disponible. ¿Le parece? 😄"
    let outputContext = itemExists ? "/contexts/siDisponible" : "/contexts/noDisponible"

    let rawResponse = {
        "fulfillmentMessages": [
            {
                "text": {
                    "text": [fulfillmentText]
                }
            }
        ],
        "outputContexts": [
            {
                "name": body['session'] + outputContext,
                "lifespanCount": 5,
            }
        ]
    }

    res.send(rawResponse);
});
