const baseAction = require('./BaseAction');

const productRepository = require("../Repository/ProductRepository");
const priceRepository = require("../Repository/PriceRepository");

const Album = require("../Models/Album");
const Presentation = require("../Models/Presentation");
const Offer = require("../Models/Offer");

let promocionesAction = {async handleAction(sender, response) {
    let offer = Offer;
    let album = Album;
    let presentation = Presentation;
    let offerInfo = await offer.find({ status: "true" });
    console.log("SOY PROMOCIONES!!!!!  INF===> " + offerInfo);
    let card = [];
    if (offerInfo.length == 0) {
        return baseAction.response(baseAction.codes.TEXT, "Por el momento, no tenemos promociones disponibles");
    }
    for (var i = 0; i < offerInfo.length; i++) {
        let offerItem = offerInfo[i];
        console.log("SOY EL ITEM " + i + "  ==>" + offerItem);
       
        let priceInfo = await priceRepository.find({ offer: offerItem._id });
        let productInfo = await productRepository.find({ price: priceInfo._id });
        let albumInfo = await album.findOne({ _id: productInfo.album });
        let presentationInfo = await presentation.findOne({ _id: productInfo.presentation });
        let itemPrice = priceInfo.basePrice - (priceInfo.basePrice * (offerItem.discount / 100));
        await priceRepository.upsert({_id: priceInfo._id},{
            salesPrice: itemPrice,
        })

        if (i < 10) {
            let postbackInfo = {
                "product_id": productInfo._id,
                "session_id": sender,
                "postback": "DEVELOPER_DEFINED_CARRITO_PROMO"
            }
            card.push({
                title: albumInfo.name + " - " + albumInfo.artist,
                image_url: productInfo.image,
                subtitle: "Formato: " + presentationInfo.type + "\n" +
                    "Antes: " + "Bs. " + priceInfo.basePrice + "\n" +
                    "Ahora: " + "Bs. " + itemPrice,
                buttons: [
                    {
                        type: "postback",
                        title: "AÑADIR AL CARRITO",
                        payload: JSON.stringify(postbackInfo),
                    }
                ]
            },
            );
        }

    }
    return baseAction.response(baseAction.codes.GENERIC,card);
}
}

module.exports = promocionesAction; 
