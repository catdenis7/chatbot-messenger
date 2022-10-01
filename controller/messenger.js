const dialogflow = require('@google-cloud/dialogflow');
var request = require("request");
const { response } = require("express");
const dialogflowApi = require("./dialogflow");
const axios = require("axios");
const { json } = require("body-parser");
const uuid = require('uuid');
//mongodb models
const mongoose = require('mongoose');

const prospectService = require('../Service/ProspectService')

const Album = require("../Models/Album");
const sessionIDs = new Map();

let messenger = {
    async saveUserData(facebookID) {
        let userData = await getUserData(facebookID);
        console.log(JSON.stringify(userData));

        if (userData.first_name == null)
            return;

        let result = await prospectService.upsert(
            {
                "facebookID": facebookID
            },
            {
                "facebookName": userData.first_name + " " + userData.last_name,
                "profilePicture": userData.profile_pic,
            },
        );
        console.log("Se creo el usuerio", result);
    },

    async sendToDialogFlow(senderID, messageText) {
        try {
            let result;
            setSessionAndUser(senderID);
            let session = sessionIDs.get(senderID);
            result = await dialogflowApi.processText(messageText, session, "FACEBOOK");
            handleDialogFlowResponse(senderID, result);
        }
        catch (error) {
            console.log("Salio mal en sendToDialogFlow", error);

        }
    }

}

async function setSessionAndUser(senderId) {
    try {
        if (!sessionIDs.has(senderId)) {
            sessionIDs.set(senderId, uuid.v1());
        }
    } catch (error) {
        throw error;
    }
}

async function getUserData(senderId) {
    console.log("consiguiendo datos del usuario...");
    let access_token = process.env.PAGE_ACCESS_TOKEN;
    try {
        let userData = await axios.get(
            "https://graph.facebook.com/v6.0/" + senderId,
            {
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
}

function isDefined(obj) {
    if (typeof obj == "undefined") {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

function handleDialogFlowResponse(sender, response) {
    let responseText = response.fulfillmentText;
    //return sendTextMessage(sender, responseText);
    let messages = response.fulfillmentMessages;
    let action = response.action;
    let contexts = response.outputContexts;
    let parameters = response.parameters;

    console.log("RESPONSE =>" + JSON.stringify(response));
    console.log("RESPONSETEXT =>" + isDefined(responseText) + " TEXTO: " + JSON.stringify(responseText));
    console.log("MESSAGE =>" + isDefined(messages) + " TEXTO: " + JSON.stringify(messages));
    console.log("ACTION =>" + isDefined(action));
    console.log("CONTEXTS =>" + isDefined(contexts));
    console.log("PARAMETERS =>" + isDefined(parameters));

    if (isDefined(action)) {
        handleDialogFlowAction(sender, response);
    } else if ((messages.length > 0)) {
        handleMessages(messages, sender);
    } else if (responseText == "" && !isDefined(action)) {
        //dialogflow no entiende la respuesta
        sendTextMessage(sender, "No entiendo lo que trataste de decir ...");
    } else if (isDefined(responseText)) {
        sendTextMessage(sender, responseText);
    }
}

async function handleDialogFlowAction(sender, response) {
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
            sendTextMessage(sender, response.fulfillmentText);
            break;
        default: break;
    }
}

async function handleMessages(messages, sender) {
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
                    await handleCardMessages(cards, sender);
                    cards = [];
                    break;
                case "text":
                    await handleMessage(messages[i], sender);
                    break;
                case "image":
                    await handleMessage(messages[i], sender);
                    break;
                case "quickReplies":
                    await handleMessage(messages[i], sender);
                    break;
                case "payload":
                    await handleMessage(messages[i], sender);
                    break;
                default:
                    break;
            }
            i += 1;
        }
    } catch (error) {
        console.log(error);
    }
}

async function handleMessage(message, sender) {
    console.log("HANDLE MESSAGE 2=> " + JSON.stringify(message));
    switch (message.message) {
        case "text": // text
            for (const text of message.text.text) {
                if (text !== "") {
                    await sendTextMessage(sender, text);
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
            await sendQuickReply(sender, message.quickReplies.title, replies);
            break;
        case "image": // image
            await sendImageMessage(sender, message.image.imageUri);
            break;
        case "payload":
            let desestructPayload = structProtoToJson(message.payload);
            var messageData = {
                recipient: {
                    id: sender,
                },
                message: desestructPayload.facebook,
            };
            await callSendAPI(messageData);
            break;
        default:
            break;
    }
}

async function sendTextMessage(recipientId, text) {
    if (text.includes("{first_name}") || text.includes("{last_name}")) {
        let userData = await getUserData(recipientId);
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
    await callSendAPI(messageData);
    console.log("FIN");
}

async function sendQuickReply(recipientId, text, replies, metadata) {
    var messageData = {
        recipient: {
            id: recipientId,
        },
        message: {
            text: text,
            metadata: isDefined(metadata) ? metadata : "",
            quick_replies: replies,
        },
    };

    await callSendAPI(messageData);
}

async function sendImageMessage(recipientId, imageUrl) {
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
    await callSendAPI(messageData);
}


function callSendAPI(messageData) {
    return new Promise((resolve, reject) => {
        request(
            {
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
}

async function handleCardMessages(messages, sender) {
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
                    payload:
                        message.card.buttons[b].postback === ""
                            ? message.card.buttons[b].text
                            : message.card.buttons[b].postback,
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
    await sendGenericMessage(sender, elements);
}

async function sendGenericMessage(recipientId, elements) {
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

    await callSendAPI(messageData);
}

module.exports = messenger;
