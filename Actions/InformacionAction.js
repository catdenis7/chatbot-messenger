const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');
const entryService = require('../Service/EntryService');

const Album = require("../Models/Album");
const Product = require("../Models/Product");
const Presentation = require("../Models/Presentation");
const Price = require("../Models/Price");
const Offer = require("../Models/Offer");

let informacionAction = {async handleAction(sender, response) {
    console.log('\n\n\n\n\n\n\n\n' + response.parameters);
    if (response.allRequiredParamsPresent) {
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
        //console.log(product.album);
        //console.log("ALBUM INFO => " + albumInfo)

        let presentationInfo = await presentation.findOne({ type: queryBody.presentation });
        //console.log("PRESENTACION INFO => " + presentationInfo);
        let nameCheck = albumInfo != null && albumInfo.name == queryBody.name;
        //console.log("NAMECHECK => " + nameCheck);
        let artistCheck = albumInfo != null && albumInfo.artist == queryBody.artist;
        //console.log("ARTISTCHECK => " + artistCheck);
        let presentationCheck = presentationInfo != null && presentationInfo.type == queryBody.presentation;
        //console.log("PRESENTATIONCHECK => " + presentationCheck);


        let itemExists = nameCheck && artistCheck && presentationCheck;
        if (itemExists) {
            let productInfo = await product.findOne({ album: albumInfo._id, presentation: presentationInfo._id });
            //console.log("product info ===> " + productInfo);
            if (productInfo != null) {
                let priceInfo = await price.findOne({ product: productInfo._id });
                //console.log("PRICE INFO => " + priceInfo);

                if (priceInfo.status) {
                    itemPrice = priceInfo.standardPrice;
                } else {
                    let offerInfo = await offer.findOne({ price: priceInfo._id });
                    //console.log("OFFER INFO => " + offerInfo);
                    if (offerInfo.status) {
                        itemPrice = priceInfo.standardPrice - (priceInfo.standardPrice * (offerInfo.discount / 100));
                    } else {
                        //console.log("ERROR: VERIFICAR STATUS DE PRICE Y OFFER");
                    }
                }
                let entryResult = await entryService.addEntry((sender), productInfo, null);
                let postbackInfo = {
                    "product_id": productInfo._id,
                    "session_id": sender,
                    "postback": "DEVELOPER_DEFINED_CARRITO"
                }
                let cards = [
                    {
                        title: albumInfo.name + " - " + albumInfo.artist,
                        image_url: productInfo.image,
                        subtitle: "Formato: " + presentationInfo.type + "\n" + "Bs. " + itemPrice,
                        buttons: [
                            {
                                type: "postback",
                                title: "AÑADIR AL CARRITO",
                                payload: JSON.stringify(postbackInfo),
                            }
                        ]
                    },
                ]
                let result = {
                    'cards' : cards,
                    'text' : 'si lo tenemos disponible ¿deseas realizar un pedido?'
                }
                return result;
                // return baseaction.response(baseaction.codes.text, "si lo tenemos disponible ¿deseas realizar un pedido?");
            } else {
                let entryResult = await entryService.addEntry((sender), null, queryBody);
                return baseAction.response(baseAction.codes.TEXT, "Disculpa, pero no tenemos ese ejemplar disponible. Puede proporcionarnos sus datos para que le notifiquemos cuando el ejemplar que desea vuelva a estar disponible. ¿Cual es su nombre? 😄");
            }
        } else {
            let entryResult = await entryService.addEntry((sender), null, queryBody);
            return baseAction.response(baseAction.codes.TEXT, "Disculpa, pero no tenemos ese ejemplar disponible. Puede proporcionarnos sus datos para que le notifiquemos cuando el ejemplar que desea vuelva a estar disponible. ¿Cual es su nombre? 😄");
        }
    } else {
        return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    }
    return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
}
}
module.exports = informacionAction; 
