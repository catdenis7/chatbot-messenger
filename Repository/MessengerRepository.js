const dialogflow = require('@google-cloud/dialogflow');
var request = require("request");
const { response } = require("express");
const axios = require("axios");
const { json } = require("body-parser");
const uuid = require('uuid');
const utils = require('../Utils/Utils')
// Services
const prospectService = require('../Service/ProspectService');
const sessionService = require("../Service/SessionService");
const clientService = require("../Service/ClientService");
//mongodb models
const mongoose = require('mongoose');
const Album = require("../Models/Album");
const Product = require("../Models/Product");
const Presentation = require("../Models/Presentation");
const Price = require("../Models/Price");
const Offer = require("../Models/Offer");
const Prospect = require("../Models/Prospect");
const entryService = require('../Service/EntryService.js');
const { default: entryRepository }=require('./EntryRepository.js');

const sessionIDs = new Map();
let startDate;

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
        switch (response.action) {
            case "CompraPromociones.action":
                console.log("PARAMETERS => ");
                console.log(JSON.stringify(response.parameters));

                if (!response.allRequiredParamsPresent) {
                    this.sendTextMessage(sender, response.fulfillmentText);
                    break;
                }
                else{
                let queryBody = {
                    "name": response["parameters"]["fields"]["nombre"]["stringValue"],
                    "lastName": response["parameters"]["fields"]["apellido"]["stringValue"],
                    "phoneNumber": response["parameters"]["fields"]["phone_number"]["stringValue"],
                    "email": response["parameters"]["fields"]["email"]["stringValue"]
                }
                let prospectQuery = {
                    "facebookID": sender
                }
                await clientService.insert(prospectQuery, queryBody);
                this.sendTextMessage(sender, response.fulfillmentText);
                }

                break;
            case "Estado6A2:DatosContacto.action":
                console.log("PARAMETERS => ");
                console.log(JSON.stringify(response.parameters));

                if (!response.allRequiredParamsPresent) {
                    this.sendTextMessage(sender, response.fulfillmentText);
                    break;
                }

                let queryBody = {
                    "name": response["parameters"]["fields"]["person"]["structValue"]["fields"]["name"]["stringValue"],
                    "lastName": response["parameters"]["fields"]["apellido"]["stringValue"],
                    "phoneNumber": response["parameters"]["fields"]["phone-number"]["stringValue"],
                    "email": response["parameters"]["fields"]["email"]["stringValue"]
                }
                let prospectQuery = {
                    "facebookID": sender
                }

                let result = await clientService.insert(prospectQuery, queryBody);
                this.sendTextMessage(sender, response.fulfillmentText);
                break;
            case "Estado4.DatosCliente.action":
                console.log("PARAMETERS => ");
                console.log(JSON.stringify(response.parameters));

                if (!response.allRequiredParamsPresent) {
                    this.sendTextMessage(sender, response.fulfillmentText);
                    break;
                }
                else{
                     let queryBody = {
                         "name": response["parameters"]["fields"]["person"]["structValue"]["fields"]["name"]["stringValue"],
                         "lastName": response["parameters"]["fields"]["apellido"]["stringValue"],
                         "phoneNumber": response["parameters"]["fields"]["phone-number"]["stringValue"],
                         "email": response["parameters"]["fields"]["email"]["stringValue"]
                     }
                     let prospectQuery = {
                         "facebookID": sender
                     }

                     let result = await clientService.insert(prospectQuery, queryBody);
                     this.sendTextMessage(sender, response.fulfillmentText);
                }
                break;
            case "Estado2.Informacion.action":
                console.log(response.parameters);
                if (response.allRequiredParamsPresent) {
                    /*response['outputContexts'] = {
                        "name": "/contexts/noDisponible",
                        "lifespancount": 5
                    };*/
                    let queryBody = {
                        "name": response["parameters"]["fields"]["albumes"]["stringValue"],
                        "artist": response["parameters"]["fields"]["artista"]["stringValue"],
                        "presentation": response["parameters"]["fields"]["presentacion"]["stringValue"]
                    }

                    let album = Album;
                    let product = Product;
                    let presentation = Presentation;
                    let price = Price;
                    let offer = Offer;
                    let itemPrice;

                    let albumInfo = await album.findOne({ name: queryBody.name, artist: queryBody.artist });
                    console.log(product.album);
                    console.log("ALBUM INFO => "+ albumInfo)

                    let presentationInfo = await presentation.findOne({ type: queryBody.presentation });
                    console.log("PRESENTACION INFO => "+ presentationInfo);
/*
                    let productInfo = await product.findOne({album: albumInfo._id, presentation: presentationInfo._id});

                    let priceInfo = await price.findOne({ product: productInfo._id });
                    console.log("PRICE INFO => "+ priceInfo);
*/
                    let nameCheck = albumInfo != null && albumInfo.name == queryBody.name;
                    console.log("NAMECHECK => " + nameCheck);
                    let artistCheck = albumInfo != null && albumInfo.artist == queryBody.artist;
                    console.log("ARTISTCHECK => " + artistCheck);
                    let presentationCheck = presentationInfo != null && presentationInfo.type == queryBody.presentation;
                    console.log("PRESENTATIONCHECK => " + presentationCheck);
                    

                    let itemExists = nameCheck && artistCheck && presentationCheck;
                    //console.log("RESPUESTA DEL RESULT =>" + itemExists);
                    if (itemExists) {
                        let productInfo = await product.findOne({album: albumInfo._id, presentation: presentationInfo._id});
                        console.log("product info ===> "+ productInfo);
                        if (productInfo != null){
                            let priceInfo = await price.findOne({product: productInfo._id});
                            console.log("PRICE INFO => "+ priceInfo);
    
                            if (priceInfo.status) {
                                itemPrice = priceInfo.standardPrice;
                            } else {
                                let offerInfo = await offer.findOne({ price: priceInfo._id });
                                console.log("OFFER INFO => "+ offerInfo);
                                if (offerInfo.status) {
                                    itemPrice = priceInfo.standardPrice - (priceInfo.standardPrice * (offerInfo.discount / 100));
                                } else {
                                    console.log("ERROR: VERIFICAR STATUS DE PRICE Y OFFER");
                                }
                            }
                            // let productInfo = await product.findOne({ $album: album.$_id });
                            let entryResult = await entryService.addEntry(this.getSessionIDs(sender), productInfo, null);
                            //console.log("PRODUCT INFO => " +productInfo);
                            await this.sendGenericMessage(sender, [
                                {
                                    title: albumInfo.name + " - " + albumInfo.artist,
                                    image_url: productInfo.image,
                                    subtitle: "Formato: " + presentationInfo.type + "\n" + "Bs. " + itemPrice,
                                },
                            ]);
                            await this.sendTextMessage(sender, "Si lo tenemos disponible ¿deseas realizar un pedido?");
                            /*response['outputContexts'] = {
                            "name": "projects/velaryonbot-naos/agent/sessions/" + sessionIDs.get(sender) + "/contexts/sidisponible",
                            "lifespancount": 5
                            };
                            console.log("CONTEXT =======>" +response.context) ;
                            console.log("CONTEXT => " + JSON.stringify(response['outputContexts']));
                            */
                        
                        } else {
                            let entryResult = await entryService.addEntry(this.getSessionIDs(sender), null, queryBody);
                        //console.log("CONTEXT => " + response['outputContexts']);
                        //await this.sendTextMessage(sender, "Disculpa, pero no tenemos ese ejemplar disponible. Pero si así lo desea, puede proporcionarnos sus datos para que le notifiquemos cuando el ejemplar que desea vuelva a estar disponible. ¿Le parece? 😄");
                        await this.sendTextMessage(sender, "Disculpa, pero no tenemos ese ejemplar disponible. Puede proporcionarnos sus datos para que le notifiquemos cuando el ejemplar que desea vuelva a estar disponible. ¿Cual es su nombre? 😄");                   
                        }
                       } else {
                        /*response['outputContexts'] = {
                            "name": "/contexts/noDisponible",
                            "lifespancount": 5
                        };
                        console.log("CONTEXT =======>" +response.context) ;
                        */
                        let entryResult = await entryService.addEntry(this.getSessionIDs(sender), null, queryBody);
                        //console.log("CONTEXT => " + response['outputContexts']);
                        //await this.sendTextMessage(sender, "Disculpa, pero no tenemos ese ejemplar disponible. Pero si así lo desea, puede proporcionarnos sus datos para que le notifiquemos cuando el ejemplar que desea vuelva a estar disponible. ¿Le parece? 😄");
                        await this.sendTextMessage(sender, "Disculpa, pero no tenemos ese ejemplar disponible. Puede proporcionarnos sus datos para que le notifiquemos cuando el ejemplar que desea vuelva a estar disponible. ¿Cual es su nombre? 😄");
                    }
                } else {
                    this.sendTextMessage(sender, response.fulfillmentText);
                }
                break;
            case "EstadoV1.ValoracionCompra.action":
                //console.log(response.parameters);
                if (response.allRequiredParamsPresent) {
                    let queryBody = {
                        "number": response["parameters"]["fields"]["number"]["numberValue"],
                    }
                    let prospect = Prospect;

                    let prospectInfo = await prospect.findOne({ $facebookID: sender });
                    //console.log("sessionID => "+ sessionIDs.get(sender));
                    //console.log("score => "+ queryBody.number);
                    //console.log("startDate => "+ startDate);
                    //console.log("endDate => "+ Date.now);
                    //console.log("prospect => "+ prospectInfo._id);
                    sessionService.upsert({ sessionID: sessionIDs.get(sender) }, {
                        score: queryBody.number,
                        endDate: Date.now(),
                    });
                    console.log("SI FUNCA V1");
                    this.sendTextMessage(sender, response.fulfillmentText);
                } else {
                    this.sendTextMessage(sender, response.fulfillmentText);
                }
                break;
            case "EstadoV2.ValoracionNoCompra.action":
                //console.log(response.parameters);
                if (response.allRequiredParamsPresent) {
                    let queryBody = {
                        "number": response["parameters"]["fields"]["number"]["numberValue"],
                    }
                    let prospect = Prospect;

                    let prospectInfo = await prospect.findOne({ $facebookID: sender });
                    //console.log("sessionID => "+ sessionIDs.get(sender));
                    //console.log("score => "+ queryBody.number);
                    //console.log("startDate => "+ startDate);
                    //console.log("endDate => "+ Date.now);
                    //console.log("prospect => "+ prospectInfo._id);
                    sessionService.upsert({ sessionID: sessionIDs.get(sender) }, {
                        score: queryBody.number,
                        endDate: Date.now(),
                    });
                    console.log("SI FUNCA V2");
                    this.sendTextMessage(sender, response.fulfillmentText);
                } else {
                    this.sendTextMessage(sender, response.fulfillmentText);
                }
                break;
            case "EstadoV3.MostrarPromos.action":
                //console.log(response.parameters);
                if (response.allRequiredParamsPresent) {
                    let queryBody = {
                        "number": response["parameters"]["fields"]["number"]["numberValue"],
                    }
                    let prospect = Prospect;

                    let prospectInfo = await prospect.findOne({ $facebookID: sender });
                    //console.log("sessionID => "+ sessionIDs.get(sender));
                    //console.log("score => "+ queryBody.number);
                    //console.log("startDate => "+ startDate);
                    //console.log("endDate => "+ Date.now);
                    //console.log("prospect => "+ prospectInfo._id);
                    sessionService.upsert({ sessionID: sessionIDs.get(sender) }, {
                        score: queryBody.number,
                        endDate: Date.now(),
                    });
                    console.log("SI FUNCA V3");
                    this.sendTextMessage(sender, response.fulfillmentText);
                } else {
                    this.sendTextMessage(sender, response.fulfillmentText);
                }
                break;
                case "Estado9V.ValoracionPromo.action":
                    //console.log(response.parameters);
                    if (response.allRequiredParamsPresent) {
                        let queryBody = {
                            "number": response["parameters"]["fields"]["number"]["numberValue"],
                        }
                        let prospect = Prospect;
    
                        let prospectInfo = await prospect.findOne({ $facebookID: sender });
                        //console.log("sessionID => "+ sessionIDs.get(sender));
                        //console.log("score => "+ queryBody.number);
                        //console.log("startDate => "+ startDate);
                        //console.log("endDate => "+ Date.now);
                        //console.log("prospect => "+ prospectInfo._id);
                        sessionService.upsert({ sessionID: sessionIDs.get(sender) }, {
                            score: queryBody.number,
                            endDate: Date.now(),
                        });
                        console.log("SI FUNCA Estado9V.ValoracionPromo.action");
                        this.sendTextMessage(sender, response.fulfillmentText);
                    } else {
                        this.sendTextMessage(sender, response.fulfillmentText);
                    }
                break;
                case "Estado7NV.Valoracion.action":
                    //console.log(response.parameters);
                    if (response.allRequiredParamsPresent) {
                        let queryBody = {
                            "number": response["parameters"]["fields"]["number"]["numberValue"],
                        }
                        let prospect = Prospect;
    
                        let prospectInfo = await prospect.findOne({ $facebookID: sender });
                        //console.log("sessionID => "+ sessionIDs.get(sender));
                        //console.log("score => "+ queryBody.number);
                        //console.log("startDate => "+ startDate);
                        //console.log("endDate => "+ Date.now);
                        //console.log("prospect => "+ prospectInfo._id);
                        sessionService.upsert({ sessionID: sessionIDs.get(sender) }, {
                            score: queryBody.number,
                            endDate: Date.now(),
                        });
                        console.log("SI FUNCA Estado7NV.Valoracion.action");
                        this.sendTextMessage(sender, response.fulfillmentText);
                    } else {
                        this.sendTextMessage(sender, response.fulfillmentText);
                    }
                break;
                case "Estado8V.ValoracionPromo.action":
                    //console.log(response.parameters);
                    if (response.allRequiredParamsPresent) {
                        let queryBody = {
                            "number": response["parameters"]["fields"]["number"]["numberValue"],
                        }
                        let prospect = Prospect;
    
                        let prospectInfo = await prospect.findOne({ $facebookID: sender });
                        //console.log("sessionID => "+ sessionIDs.get(sender));
                        //console.log("score => "+ queryBody.number);
                        //console.log("startDate => "+ startDate);
                        //console.log("endDate => "+ Date.now);
                        //console.log("prospect => "+ prospectInfo._id);
                        sessionService.upsert({ sessionID: sessionIDs.get(sender) }, {
                            score: queryBody.number,
                            endDate: Date.now(),
                        });
                        console.log("SI FUNCA Estado8V.ValoracionPromo.action");
                        this.sendTextMessage(sender, response.fulfillmentText);
                    } else {
                        this.sendTextMessage(sender, response.fulfillmentText);
                    }
                break;
            case "Estado7A.EleccionPromo.action":
                let offer7A = Offer;
                let price7A = Price;
                let product7A = Product;
                let album7A = Album;
                let presentation7A = Presentation;
                let offerInfo7A = await offer7A.find({ status: "true" });
                console.log("SOY OOFER  INF===> "+ offerInfo7A);
                let card7A = [];
                if (offerInfo7A.length == 0){
                    this.sendTextMessage(sender, "Por el momento, no tenemos promociones disponibles");
                    break;
                }
                for (var i = 0; i < offerInfo7A.length; i++) {
                    let offerItem7A = offerInfo7A[i];
                    console.log("SOY EL ITEM " +i+ "  ==>" + offerItem7A);
                    console.log("Soy el ID de Item " + offerItem7A.price);
                    //let offerCompare = await offer.findOne({$_id:offerItem.$price});
                    let priceInfo7A = await price7A.findOne({_id:offerItem7A.price});
                    let productInfo7A = await product7A.findOne({_id:priceInfo7A.product});
                    let albumInfo7A = await album7A.findOne({ _id: productInfo7A.album });
                    let presentationInfo7A = await presentation7A.findOne({ _id: productInfo7A.presentation});
                    let itemPrice7A = priceInfo7A.standardPrice - (priceInfo7A.standardPrice * (offerItem7A.discount/100));
                    
                    /*
                    console.log("priceInfo7A =>" + priceInfo7A);
                    console.log("priceInfo7A =>" + priceInfo7A);
                    console.log("productInfo7A =>" + productInfo7A);
                    console.log("albumInfo7A =>" + albumInfo7A);
                    console.log("presentationInfo7A =>" + presentationInfo7A);
                    console.log("itemPrice7A =>" + itemPrice7A);
                    */
                    
                    if (i < 10){
                        card7A.push({
                            title: albumInfo7A.name + " - " + albumInfo7A.artist,
                            image_url: productInfo7A.image,
                            subtitle: "Formato: " + presentationInfo7A.type + "\n" + 
                                      "Antes: " + "Bs. "+ priceInfo7A.standardPrice + "\n"+ 
                                      "Ahora: " + "Bs. " + itemPrice7A,
                            buttons:[
                                {
                                  type:"postback",
                                  title:"Comprar",
                                  payload:"DEVELOPER_DEFINED_COMPRAR_ESTADO7A",
                                }              
                              ]    
                        },
                        ); 
                    }
              
                 }
                await this.sendGenericMessage(sender, card7A);
                break;
            case "Estado9.Promociones.action":
                let offer = Offer;
                let price = Price;
                let product = Product;
                let album = Album;
                let presentation = Presentation;
                let offerInfo = await offer.find({ status: "true" });
                console.log("SOY OOFER  INF===> "+ offerInfo);
                let card = [];
                if (offerInfo.length == 0){
                    this.sendTextMessage(sender, "Por el momento, no tenemos promociones disponibles");
                    break;
                }
                for (var i = 0; i < offerInfo.length; i++) {
                    let offerItem = offerInfo[i];
                    console.log("SOY EL ITEM " +i+ "  ==>" +offerItem);
                    console.log("Soy el ID de Item " +offerItem.price);
                    //let offerCompare = await offer.findOne({$_id:offerItem.$price});
                    let priceInfo = await price.findOne({_id:offerItem.price});
                    let productInfo = await product.findOne({_id:priceInfo.product});
                    let albumInfo = await album.findOne({ _id: productInfo.album });
                    let presentationInfo = await presentation.findOne({ _id: productInfo.presentation});
                    let itemPrice = priceInfo.standardPrice - (priceInfo.standardPrice * (offerItem.discount/100));
                    
                    /*
                    console.log("priceInfo =>" + priceInfo);
                    console.log("priceInfo =>" + priceInfo);
                    console.log("productInfo =>" + productInfo);
                    console.log("albumInfo =>" + albumInfo);
                    console.log("presentationInfo =>" + presentationInfo);
                    console.log("itemPrice =>" + itemPrice);
                    */
                    
                    if (i < 10){
                        let postbackInfo = {
                            "product_id" : productInfo._id,
                            "session_id" : sessionIDs.get(sender),
                            "postback" : "DEVELOPER_DEFINED_COMPRA"
                        }
                        card.push({
                            title: albumInfo.name + " - " + albumInfo.artist,
                            image_url: productInfo.image,
                            subtitle: "Formato: " + presentationInfo.type + "\n" + 
                                      "Antes: " + "Bs. "+ priceInfo.standardPrice + "\n"+ 
                                      "Ahora: " + "Bs. " + itemPrice,
                            buttons:[
                                {
                                  type:"postback",
                                  title:"Compra",
                                  payload:JSON.stringify(postbackInfo),
                                }              
                              ]    
                        },
                        ); 
                    }
              
                 }
                await this.sendGenericMessage(sender, card);
                break;
            case "Estado11.Ubicacion.action":
                await this.sendImageMessage(sender,"https://www.dondeir.com/wp-content/uploads/2017/05/tienda-de-discos-chowell.jpg");
                await this.sendButtonMessage(sender, "¡Hola! Gracias por comunicarte con nosotros. Estamos ubicados entre la Calle Sucre y René Moreno, al frente de la plaza 24 de septiembre.", [
                    {
                      type: "web_url",
                      url: "https://www.google.es/maps/place/Burger+King+-+Plaza+24/@-17.7838235,-63.2209568,13z/data=!4m9!1m2!2m1!1sBurger+King!3m5!1s0x93f1e80d16515083:0xee06d0de7b1a672d!8m2!3d-17.7838253!4d-63.1813674!15sCgtCdXJnZXIgS2luZyIDiAEBWg0iC2J1cmdlciBraW5nkgEUZmFzdF9mb29kX3Jlc3RhdXJhbnTgAQA?hl=es",
                      title: "Abrir en Google Maps",
                    },
                  ]);
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
                uri: "https://graph.facebook.com/v6.0/me/messages",
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
}

module.exports = messengerRespository;
