const messengerService = require("../Service/MessengerService");

var request = require("request");
const { response } = require("express");
const { json } = require("body-parser");

let chatbotRepository = {

    // Funcion donde se procesara el evento
    async processEvent(event) {
        // Capturamos los datos del que genera el evento y el mensaje
        var senderID = event.sender.id;
        var message = event.message;
        console.log(JSON.stringify(event));

        messengerService.saveUserData(senderID);
        // Si en el evento existe un mensaje de tipo texto
        if (senderID == "110434878458920") {
            console.log("Evento Bot" + JSON.stringify(event));
            return;
        }
        if (message.text) {
            // Crear un payload para un simple mensaje de texto
            //let dialogFlowResponse = await dialogflowApi.processText(message.text, senderID);
            console.log("MENSAJE DEL USUARIO: ", message.text);
            await messengerService.sendToDialogFlow(senderID, message.text);
            /* var response = {
                 text: dialogFlowResponse,
             };
             */
        }

        // Enviamos el mensaje mediante SendAPI
        this.sendText(senderID, response);
    },

    // Funcion donde el chat respondera usando SendAPI
    sendText(senderID, response) {
        // Construcicon del cuerpo del mensaje
        let request_body = {
            recipient: {
                id: senderID,
            },
            message: response,
        };

        // Enviar el requisito HTTP a la plataforma de messenger
        request({
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
    },

    async receivedPostback(event) {
        var senderId = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;
      
        var payload = event.postback.payload;
        switch (payload) {
          default:
            //unindentified payload
            await messengerService.sendToDialogFlow(senderId, payload);
            break;
        }
      
        console.log(
          "Received postback for user %d and page %d with payload '%s' " + "at %d",
          senderId,
          recipientID,
          payload,
          timeOfPostback
        );
      }
}

module.exports = chatbotRepository;