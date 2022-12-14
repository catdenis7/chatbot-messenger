var request = require("request");

const { response } = require("express");

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
        entry.messaging.forEach(function (event) {
          if (event.message) {
            processEvent(event);
          }
        });
      });
      res.sendStatus(200);
    }
  },

 
};

 // Funcion donde se procesara el evento
  function processEvent(event) {
    // Capturamos los datos del que genera el evento y el mensaje
    var senderID = event.sender.id;
    var message = event.message;

    // Si en el evento existe un mensaje de tipo texto
    if (message.text) {
      // Crear un payload para un simple mensaje de texto
      var response = {
        text: "Enviaste este mensaje: " + message.text,
      };
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
