const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');
const entryService = require('../Service/EntryService');

const Album = require("../Models/Album");
const Presentation = require("../Models/Presentation");
const Offer = require("../Models/Offer");

const productRepository = require("../Repository/ProductRepository");
const priceRepository = require("../Repository/PriceRepository");

let informacionAction = {async handleAction(sender, response) {
    if (response.allRequiredParamsPresent) {
        let queryBody = {
            "name": response["parameters"]["fields"]["albumes"]["stringValue"],
            "artist": response["parameters"]["fields"]["artista"]["stringValue"],
            "presentation": response["parameters"]["fields"]["presentacion"]["stringValue"]
        }

        let album = Album;
        let presentation = Presentation;
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
            let productInfo = await productRepository.find({ album: albumInfo._id, presentation: presentationInfo._id });
            //console.log("product info ===> " + productInfo);
            if (productInfo != null) {
                let priceInfo = await priceRepository.find({ _id: productInfo.price});
                console.log("PRICE INFO => " + priceInfo);
             
                if (priceInfo.offer == null) {
                    itemPrice = priceInfo.basePrice;
                    await priceRepository.upsert({_id: priceInfo._id}, {
                        salesPrice: itemPrice,
                    });
                } else {
                    let offerInfo = await offer.findOne({ _id: priceInfo.offer});
                    //console.log("OFFER INFO => " + offerInfo);
                    if (offerInfo.status) {
                        itemPrice = priceInfo.basePrice - (priceInfo.basePrice * (offerInfo.discount / 100));
                        console.log("SOY EL PRECIO DEL DESCUENTO ===>" +itemPrice);
                        await priceRepository.upsert({_id: priceInfo._id}, {
                            salesPrice: itemPrice,
                        });
                        console.log("PRICE DESCUENTO => " + priceInfo.salesPrice);
                    } else {
                        itemPrice = priceInfo.basePrice;
                        await priceRepository.upsert({_id: priceInfo._id}, {
                            salesPrice: itemPrice,
                        });
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
}
}
module.exports = informacionAction; 
