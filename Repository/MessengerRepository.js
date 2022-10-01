const dialogflow = require('@google-cloud/dialogflow');
var request = require("request");
const { response } = require("express");
const dialogflowApi = require("./DialogflowController");
const axios = require("axios");
const { json } = require("body-parser");
const uuid = require('uuid');
const utils = require('../Utils/Utils')
    //mongodb models
const mongoose = require('mongoose');

const prospectService = require('../Service/ProspectService')

const Album = require("../Models/Album");
const sessionIDs = new Map();

let messengerRespository = {

    getSessionIDs(sessionID) {
        return sessionIDs.get(sessionID);
    },

    async setSessionAndUser(senderId) {
        try {
            if (!sessionIDs.has(senderId)) {
                sessionIDs.set(senderId, uuid.v1());
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
                "https://graph.facebook.com/v6.0/" + senderId, {
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
        //return sendTextMessage(sender, responseText);
        let messages = response.fulfillmentMessages;
        let action = response.action;
        let contexts = response.outputContexts;
        let parameters = response.parameters;

        console.log("RESPONSE =>" + JSON.stringify(response));
        console.log("RESPONSETEXT =>" + this.sDefined(responseText) + " TEXTO: " + JSON.stringify(responseText));
        console.log("MESSAGE =>" + this.sDefined(messages) + " TEXTO: " + JSON.stringify(messages));
        console.log("ACTION =>" + this.sDefined(action));
        console.log("CONTEXTS =>" + this.sDefined(contexts));
        console.log("PARAMETERS =>" + this.sDefined(parameters));

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
        switch (response.action) {
            case "Estado2.Informacion.action":
                console.log(response.parameters);
                if (response.allRequiredParamsPresent) {
                    response['outputContexts'] = {
                        "name": "/contexts/noDisponible",
                        "lifespancount": 5
                    };
                    let queryBody = {
                        "name": response["parameters"]["fields"]["albumes"]["stringValue"],
                        "artist": response["parameters"]["fields"]["artista"]["stringValue"],
                        "presentation": response["parameters"]["fields"]["presentacion"]["stringValue"]
                    }

                    let album = Album;
                    let result = await album.findOne(queryBody);

                    let itemExists = result != null;

                    response.fulfillmentText = itemExists ? "Si lo tenemos disponible ¿deseas realizar un pedido?" : "Disculpa, pero no tenemos ese ejemplar disponible. Pero si así lo desea, puede proporcionarnos sus datos para que le notifiquemos cuando el ejemplar que desea vuelva a estar disponible. ¿Le parece? 😄";
                }
                this.sendTextMessage(sender, response.fulfillmentText);
                break;
            default:
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


    callSendAPI(messageData) {
        return new Promise((resolve, reject) => {
            request({
                    uri: "https://graph.facebook.com/v6.0/me/messages",
                    qs: {
                        access_token: process.env.PAGE_ACCESS_TOKEN,
                    },
                    method: "POST",
                    json: messageData,
                },
                function(error, response, body) {
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
}

module.exports = messengerRespository;