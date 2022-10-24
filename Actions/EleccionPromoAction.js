const baseAction = require('./BaseAction');
const Album = require("../Models/Album");
const Product = require("../Models/Product");
const Presentation = require("../Models/Presentation");
const Price = require("../Models/Price");
const Offer = require("../Models/Offer");

let eleccionPromoAction = {async handleAction(sender, response) {
    let offer = Offer;
    let price = Price;
    let product = Product;
    let album = Album;
    let presentation = Presentation;
    let offerInfo = await offer.find({ status: "true" });
    console.log("SOY OOFER  INF===> " + offerInfo);
    let card = [];
    if (offerInfo.length == 0) {
        return baseAction.response(baseAction.codes.TEXT, "Por el momento, no tenemos promociones disponibles");
    }
    for (var i = 0; i < offerInfo.length; i++) {
        let offerItem = offerInfo[i];
        console.log("SOY EL ITEM " + i + "  ==>" + offerItem);
        console.log("Soy el ID de Item " + offerItem.price);
        let priceInfo = await price.findOne({ _id: offerItem.price });
        let productInfo = await product.findOne({ _id: priceInfo.product });
        let albumInfo = await album.findOne({ _id: productInfo.album });
        let presentationInfo = await presentation.findOne({ _id: productInfo.presentation });
        let itemPrice = priceInfo.standardPrice - (priceInfo.standardPrice * (offerItem.discount / 100));

        if (i < 10) {
            let postbackInfo = {
                "product_id": productInfo._id,
                "session_id": sender,
                "postback": "DEVELOPER_DEFINED_COMPRAR_ESTADO7A"
            }
            card.push({
                title: albumInfo.name + " - " + albumInfo.artist,
                image_url: productInfo.image,
                subtitle: "Formato: " + presentationInfo.type + "\n" +
                    "Antes: " + "Bs. " + priceInfo.standardPrice + "\n" +
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
    return baseAction.response(baseAction.codes.GENERIC, card);
}
}

module.exports = eleccionPromoAction; 
