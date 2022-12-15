var request = require("request");
const { response } = require("express");
const axios = require("axios");
const uuid = require('uuid');
const utils = require('../Utils/Utils')

let datosContactoAction = require('../Actions/DatosContactoAction');
let datosClienteAction = require('../Actions/DatosClienteAction');
let informacionAction = require('../Actions/InformacionAction');
let valoracionCompraAction = require('../Actions/ValoracionCompra');
let eleccionPromoAction = require('../Actions/EleccionPromoAction');
let promocionesAction = require('../Actions/PromocionesAction');
let adicionarAlCarritoAction = require('../Actions/AdicionarAlCarritoAction');
let detalleCarritoAction = require('../Actions/DetalleCarritoAction');
let filtrarClienteExistenteAction = require('../Actions/FiltrarClienteExistente');
let mostrarMetodoDePagoAction = require('../Actions/MostrarMetodoDePagoAction');
let productosArtistaAction = require('../Actions/ProductosArtistaAction');
let comprobantePagoAction = require('../Actions/ComprobantePagoAction');
let ordenPendienteAction = require('../Actions/OrdenPendienteAction');
let preciosAction = require("../Actions/PreciosAction");
const { postToFeed }=require("../Service/MessengerService.js");

const sessionIDs = new Map();

let messengerRespository = {

    getSessionIDs(sessionID) {
        return sessionIDs.get(sessionID);
    },

    async setSessionAndUser(senderId) {
        try {
            if (!sessionIDs.has(senderId)) {
                sessionIDs.set(senderId, uuid.v1());
                startDate = Date.now();
            }
        } catch (error) {
            throw error;
        }
    },

    async getUserData(senderId) {
        console.log("consiguiendo datos del usuario...");
        let access_token = process.env.PAGE_ACCESS_TOKEN;
        try {
            let userData = await axios.get(
                process.env.FACEBOOK_API_URL + senderId, {
                params: {
                    access_token,
                },
            }
            );
            return userData.data;
        } catch (err) {
            console.log("algo salio mal en axios getUserData: ", err);
            return {
                first_name: "",
                last_name: "",
                profile_picture: "",
            };
        }
    },

    isDefined(obj) {
        if (typeof obj == "undefined") {
            return false;
        }

        if (!obj) {
            return false;
        }

        return obj != null;
    },

    handleDialogFlowResponse(sender, response) {
        let responseText = response.fulfillmentText;
        let messages = response.fulfillmentMessages;
        let action = response.action;
        let contexts = response.outputContexts;
        let parameters = response.parameters;

        console.log("RESPONSE =>" + JSON.stringify(response));
        console.log("RESPONSETEXT =>" + this.isDefined(responseText) + " TEXTO: " + JSON.stringify(responseText));
        console.log("MESSAGE =>" + this.isDefined(messages) + " TEXTO: " + JSON.stringify(messages));
        console.log("ACTION =>" + this.isDefined(action));
        console.log("CONTEXTS =>" + this.isDefined(contexts));
        console.log("PARAMETERS =>" + this.isDefined(parameters));

        if (this.isDefined(action)) {
            this.handleDialogFlowAction(sender, response);

        } else if ((messages.length > 0)) {
            this.handleMessages(messages, sender);
        } else if (responseText == "" && !this.isDefined(action)) {
            //dialogflow no entiende la respuesta
            this.sendTextMessage(sender, "No entiendo lo que trataste de decir ...");
        } else if (this.isDefined(responseText)) {
            this.sendTextMessage(sender, responseText);
        }
    },

    async handleDialogFlowAction(sender, response) {
        let result;
        console.log("\n\n\n\n\n\n\n" + response.action + "\n\n\n\n\n\n")
        switch (response.action) {
            case "Estado2.Informacion.action":
                result = await informacionAction.handleAction(this.getSessionIDs(sender), response);
                if (result.cards == null) {
                    this.sendMessageHandler(sender, result);
                    break;
                }
                await this.sendTextMessage(sender, result.text);
                await this.sendGenericMessage(sender, result.cards);
                break;
            case "Estado5.Detalle.SeguirComprando.action":
            case "Estado20.SeguirComprandoDetalleNoDisponible.action":
                this.sendMessageHandler(sender, await adicionarAlCarritoAction.handleAction(sender, response));
                break;
            case "Estado6.DetalleCarrito.action":
            case "Estado22.DetalleCarritoNoDisponible.action":
                result = await detalleCarritoAction.handleAction(sender, response);
                if (result.buttons == null) {
                    this.sendMessageHandler(sender, result);
                    break;
                }
                await this.sendTextMessage(sender, result.text);
                await this.sendButtonMessage(sender, result.buttons.text, result.buttons.buttons);

                break;
            case "Estado8.DatosCliente.action":
                result = await datosClienteAction.handleAction(sender, response);
                if (result.text == null) {
                    await this.sendMessageHandler(sender, result);
                    break;
                }
                await this.sendImageMessage(sender, result.image);
                await this.sendTextMessage(sender, result.text);
                break;
            case "Estado9.ComprobantePago.action":
                await this.sendMessageHandler(sender, await comprobantePagoAction.handleAction(sender, response));
                break;
            case "Estado10.ValoracionCompra.action":
            case "Estado12.ValoracionNoCompra.action":
            case "Estado17.Valoracion.action":
            case "Estado28.ValoracionPromo.action":
                this.sendMessageHandler(sender, await valoracionCompraAction.handleAction(this.getSessionIDs(sender), response));
                break;
            case "Estado14.DatosCliente.action":
                await this.sendMessageHandler(sender, await datosContactoAction.handleAction(sender, response));
                break;
            case "Estado18.ProductosEnPromocion.action":
                this.sendMessageHandler(sender, await eleccionPromoAction.handleAction(this.getSessionIDs(sender), response));
                break;
            case "Estado25.ProductosArtista.action":
                this.sendMessageHandler(sender, await productosArtistaAction.handleAction(this.getSessionIDs(sender), response));
                break;
            case "Estado26.Promociones.action":
                console.error(response.action);
                this.sendMessageHandler(sender, await promocionesAction.handleAction(this.getSessionIDs(sender), response));
                break;
            case "Estado29.Ubicacion.action":
                await this.sendImageMessage(sender, "https://www.dondeir.com/wp-content/uploads/2017/05/tienda-de-discos-chowell.jpg");
                await this.sendButtonMessage(sender, "¡Hola! Gracias por comunicarte con nosotros. Estamos ubicados entre la Calle Sucre y René Moreno, al frente de la plaza 24 de septiembre.", [
                    {
                        type: "web_url",
                        url: "https://www.google.es/maps/place/Burger+King+-+Plaza+24/@-17.7838235,-63.2209568,13z/data=!4m9!1m2!2m1!1sBurger+King!3m5!1s0x93f1e80d16515083:0xee06d0de7b1a672d!8m2!3d-17.7838253!4d-63.1813674!15sCgtCdXJnZXIgS2luZyIDiAEBWg0iC2J1cmdlciBraW5nkgEUZmFzdF9mb29kX3Jlc3RhdXJhbnTgAQA?hl=es",
                        title: "Abrir en Google Maps",
                    },
                ]);
                break;
            case "Estado31.ClienteExistente.action":
                result = await filtrarClienteExistenteAction.handleAction(sender, response);
                if (result.buttons == null) {
                    this.sendMessageHandler(sender, result);
                    break;
                }
                await this.sendButtonMessage(sender, result.text, result.buttons);
                break;
            case "Estado31.ClienteExistenteB.action":
                result = await mostrarMetodoDePagoAction.handleAction(sender, response);
                if (result.text == null) {
                    await this.sendMessageHandler(sender, result);
                    break;
                }
                await this.sendImageMessage(sender, result.image);
                await this.sendTextMessage(sender, result.text);
                break;
            case "Estado32.OrdenPendiente.action":
                result = await ordenPendienteAction.handleAction(sender, response);
                if (result.buttons == null) {
                    this.sendMessageHandler(sender, result);
                    break;
                }
                await this.sendButtonMessage(sender, result.text, result.buttons);
                break;
            case "Estado33.Precios.action":
                result = await preciosAction.handleAction(sender, response);
                break;
            default:
                await this.sendTextMessage(sender, response.fulfillmentText);
                break;
        }
    },

    async handleMessages(messages, sender) {
        console.log("HANDLE MESSAGE 1 => " + JSON.stringify(messages));
        try {
            let i = 0;
            let cards = [];
            while (i < messages.length) {
                switch (messages[i].message) {
                    case "card":
                        for (let j = i; j < messages.length; j++) {
                            if (messages[j].message === "card") {
                                cards.push(messages[j]);
                                i += 1;
                            } else j = 9999;
                        }
                        await this.handleCardMessages(cards, sender);
                        cards = [];
                        break;
                    case "text":
                        await this.handleMessage(messages[i], sender);
                        break;
                    case "image":
                        await this.handleMessage(messages[i], sender);
                        break;
                    case "quickReplies":
                        await this.handleMessage(messages[i], sender);
                        break;
                    case "payload":
                        await this.handleMessage(messages[i], sender);
                        break;
                    default:
                        break;
                }
                i += 1;
            }
        } catch (error) {
            console.log(error);
        }
    },

    async handleMessage(message, sender) {
        console.log("HANDLE MESSAGE 2=> " + JSON.stringify(message));
        switch (message.message) {
            case "text": // text
                for (const text of message.text.text) {
                    if (text !== "") {
                        await this.sendTextMessage(sender, text);
                    }
                }
                break;
            case "quickReplies": // quick replies
                let replies = [];
                message.quickReplies.quickReplies.forEach((text) => {
                    let reply = {
                        content_type: "text",
                        title: text,
                        payload: text,
                    };
                    replies.push(reply);
                });
                await this.sendQuickReply(sender, message.quickReplies.title, replies);
                break;
            case "image": // image
                await this.sendImageMessage(sender, message.image.imageUri);
                break;
            case "payload":
                let desestructPayload = utils.structProtoToJson(message.payload);
                var messageData = {
                    recipient: {
                        id: sender,
                    },
                    message: desestructPayload.facebook,
                };
                await this.callSendAPI(messageData);
                break;
            default:
                break;
        }
    },

    async sendMessageHandler(sender, result) {
        console.log(JSON.stringify(result));
        switch (result["code"]) {
            case 1:
                this.sendButtonMessage(sender, result.data.text, result.data.buttons);
                break;
            case 2:
                this.sendGenericMessage(sender, result.data);
                break;
            case 3:
                this.sendImageMessage(sender, result.data);
                break;
            case 4:
                this.sendQuickReply(sender, result.data);
                break;
            case 5:
            /*
            this.sendGenericReceiptMessage(sender, result.data);
            break;
        case 6:
            */
            default:
                this.sendTextMessage(sender, result.data);
                break;
        }
    },

    async sendTextMessage(recipientId, text) {
        if (text.includes("{first_name}") || text.includes("{last_name}")) {
            let userData = await this.getUserData(recipientId);
            text = text
                .replace("{first_name}", userData.first_name)
                .replace("{last_name}", userData.last_name);
        }
        var messageData = {
            recipient: {
                id: recipientId,
            },
            message: {
                text: text,
            },
        };
        console.log("INICIO");
        await this.callSendAPI(messageData);
        console.log("FIN");
    },
    async sendQuickReply(recipientId, text, replies, metadata) {
        var messageData = {
            recipient: {
                id: recipientId,
            },
            message: {
                text: text,
                metadata: this.isDefined(metadata) ? metadata : "",
                quick_replies: replies,
            },
        };

        await this.callSendAPI(messageData);
    },

    async sendImageMessage(recipientId, imageUrl) {
        var messageData = {
            recipient: {
                id: recipientId,
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {
                        url: imageUrl,
                    },
                },
            },
        };
        await this.callSendAPI(messageData);
    },

    async sendButtonMessage(recipientId, text, buttons) {
        var messageData = {
            recipient: {
                id: recipientId,
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: text,
                        buttons: buttons,
                    },
                },
            },
        };
        await this.callSendAPI(messageData);
    },


    callSendAPI(messageData) {
        return new Promise((resolve, reject) => {
            request({
                uri: process.env.FACEBOOK_API_URL + "/me/messages",
                qs: {
                    access_token: process.env.PAGE_ACCESS_TOKEN,
                },
                method: "POST",
                json: messageData,
            },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var recipientId = body.recipient_id;
                        var messageId = body.message_id;

                        if (messageId) {
                            console.log(
                                "Successfully sent message with id %s to recipient %s",
                                messageId,
                                recipientId
                            );
                        } else {
                            console.log(
                                "Successfully called Send API for recipient %s",
                                recipientId
                            );
                        }
                        resolve();
                    } else {
                        reject();
                        console.error(
                            "Failed calling Send API",
                            response.statusCode,
                            response.statusMessage,
                            body.error
                        );
                    }
                }
            );
        });
    },

    async handleCardMessages(messages, sender) {
        let elements = [];
        for (let m = 0; m < messages.length; m++) {
            let message = messages[m];
            let buttons = [];
            for (let b = 0; b < message.card.buttons.length; b++) {
                let isLink = message.card.buttons[b].postback.substring(0, 4) === "http";
                let button;
                if (isLink) {
                    button = {
                        type: "web_url",
                        title: message.card.buttons[b].text,
                        url: message.card.buttons[b].postback,
                    };
                } else {
                    button = {
                        type: "postback",
                        title: message.card.buttons[b].text,
                        payload: message.card.buttons[b].postback === "" ?
                            message.card.buttons[b].text : message.card.buttons[b].postback,
                    };
                }
                buttons.push(button);
            }

            let element = {
                title: message.card.title,
                image_url: message.card.imageUri,
                subtitle: message.card.subtitle,
                buttons,
            };
            elements.push(element);
        }
        await this.sendGenericMessage(sender, elements);
    },

    async sendGenericMessage(recipientId, elements) {
        var messageData = {
            recipient: {
                id: recipientId,
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements,
                    },
                },
            },
        };

        await this.callSendAPI(messageData);
    },
    /*
        async sendGenericReceiptMessage(recipientId, elements) {
            var messageData = {
                recipient: {
                    id: recipientId,
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "receipt",
                            elements: elements,
                        },
                    },
                },
            };
    
            await this.callSendAPI(messageData);
        },
        */
    async postToFeed(photo, message){
       let response = await axios({
            url : process.env.FACEBOOK_API_URL + process.env.FACEBOOK_SENDER_ID + '/photos',
            method : 'POST',
            params : {
                url : photo,
                message : message,
                access_token : process.env.PAGE_ACCESS_TOKEN
            }
        }); 
        return response;
    }
}


module.exports = messengerRespository;
