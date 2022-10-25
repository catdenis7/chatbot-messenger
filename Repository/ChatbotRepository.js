const messengerService = require("../Service/MessengerService");
const entryService = require("../Service/EntryService");
const orderDetailRepository = require("../Repository/OrderDetailRepository");
const orderRepository = require("../Repository/OrderRepository");
const sessionRepository = require("../Repository/SessionRepository");
const prospectRepository = require("../Repository/ProspectRepository");
const clientRepository = require("../Repository/ClientRepository");
const Product = require("../Models/Product.js");
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
        if (senderID == String(process.env.FACEBOOK_SENDER_ID)) {
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
                uri: process.env.FACEBOOK_API_URL + "/me/messages",
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
                let deserialized = JSON.parse(payload);
                let command = deserialized.postback;
                let sessionId = deserialized.session_id;
                let productModel;
                let product;

        console.log(payload);
        switch (command) {
            case "DEVELOPER_DEFINED_COMPRA":
                productModel = Product;
                product = await productModel.findById(deserialized.product_id);
                console.log('PRODUCT ===>' + product);
                await entryService.addEntry(sessionId,product,null)
                await messengerService.sendToDialogFlow(senderId, payload);
                break;
            case "DEVELOPER_DEFINED_CARRITO":
                productModel = Product;
                product = await productModel.findById(deserialized.product_id);
                console.log('PRODUCT CARRITO ===>' + product);
                let queryOrderDetail;
                let queryOrder;
              
                let getSession = await sessionRepository.find({sessionID: sessionId});
                console.log("SOY GETSESSION ===>" + getSession);
                let getProspect = await prospectRepository.find({_id: getSession.prospect});
                console.log("SOY GET PROSPECT ===>" + getProspect);
                let checkClient = await clientRepository.find({prospect: getProspect._id}, true);
                console.log("SOY EL CHECKCLIENT ===> " + checkClient);
                if (checkClient == null){
                    await clientRepository.insert({
                        name: getProspect.facebookName,
                        lastName: null,
                        phoneNumber: null,
                        email: null,
                        type: "P",
                        prospect: getProspect._id,
                    });
                }
                let getClient = await clientRepository.find({prospect: getProspect._id});
                console.log("SOY GET CLIENT ===>" + getClient);
                let checkOrder = await orderRepository.find({type: "C", client: getClient._id});
                console.log("SOY GET CHECK ORDER ===>" + checkOrder);
                if (checkOrder == null){
                    queryOrder = {
                        "date": Date.now(),
                        "type": "C",
                        "status":"ABIERTO",
                        "total": null,
                        "client": getClient._id,
                    }
                    let result = await orderRepository.insert(queryOrder);
                    queryOrderDetail = {
                        "quantity": null,
                        "productPrice": null,
                        "detailTotal": null,
                        "order": result._id,
                        "product": product._id,
    
                    }
                    await orderDetailRepository.insert(queryOrderDetail);
                } else {
                    queryOrderDetail = {
                        "quantity": null,
                        "productPrice": null,
                        "detailTotal": null,
                        "order": checkOrder._id,
                        "product": product._id,
    
                    }
                    await orderDetailRepository.insert(queryOrderDetail);
                }
                await messengerService.sendToDialogFlow(senderId, payload);
                break;
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
