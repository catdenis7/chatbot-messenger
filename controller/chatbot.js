var request = require("request");
const { response } = require("express");
const dialogflowApi = require("./dialogflow");
const { json } = require("body-parser");
const messenger = require("./messenger");
// mongoose 
const mongoose = require('mongoose');


mongoose.connect(
    'mongodb+srv://corlysvelaryon:test@mondongo-bot.zakwctm.mongodb.net/velaryon?retryWrites=true&w=majority',
    (err, res) => {
        if (err) return console.log("Hubo un error en la base de datos ", err);
        console.log("BASE DE DATOS ONLINE");
    }
);

let chatbot = {
    index(req, res) {
        res.send("Se ha desplegado de manera exitosa el Vellaryon ChatBot :D!!!");
    },

    verification(req, res) {
        // Verificar la coincidendia del token
        if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
            // Mensaje de exito y envio del token requerido
            console.log("webhook verificado!");
            res.status(200).send(req.query["hub.challenge"]);
        } else {
            // Mensaje de fallo
            console.error(
                "La verificacion ha fallado, porque los tokens no coinciden"
            );
            res.sendStatus(403);
        }
    },

    responseHandler(req, res) {
        // Verificar si el evento proviene del pagina asociada
        if (req.body.object == "page") {
            // Si existe multiples entradas entradas
            req.body.entry.forEach(function (entry) {
                // Iterara todos lo eventos capturados
                entry.messaging.forEach(async function (event) {
                    if (event.message) {
                        await processEvent(event);
                    }
                });
            });
            res.sendStatus(200);
        }
    },


};

// Funcion donde se procesara el evento
async function processEvent(event) {
    // Capturamos los datos del que genera el evento y el mensaje
    var senderID = event.sender.id;
    var message = event.message;
    console.log(JSON.stringify(event));

    messenger.saveUserData(senderID);
    // Si en el evento existe un mensaje de tipo texto
    if (senderID == "110434878458920") return;
    if (message.text) {
        // Crear un payload para un simple mensaje de texto
        //let dialogFlowResponse = await dialogflowApi.processText(message.text, senderID);
        console.log("MENSAJE DEL USUARIO: ", message.text);
        await messenger.sendToDialogFlow(senderID, message.text);
       /* var response = {
            text: dialogFlowResponse,
        };
        */
    }

    // Enviamos el mensaje mediante SendAPI
    sendText(senderID, response);
};

// Funcion donde el chat respondera usando SendAPI
function sendText(senderID, response) {
    // Construcicon del cuerpo del mensaje
    let request_body = {
        recipient: {
            id: senderID,
        },
        message: response,
    };

    // Enviar el requisito HTTP a la plataforma de messenger
    request(
        {
            uri: "https://graph.facebook.com/v2.6/me/messages",
            qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
            method: "POST",
            json: request_body,
        },
        (err, res, body) => {
            if (!err) {
                console.log("Mensaje enviado!");
            } else {
                console.error("No se puedo enviar el mensaje:" + err);
            }
        }
    );
}

module.exports = chatbot;
