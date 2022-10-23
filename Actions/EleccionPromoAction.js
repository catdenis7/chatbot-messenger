const baseAction = require('./BaseAction');
const Album = require("../Models/Album");
const Product = require("../Models/Product");
const Presentation = require("../Models/Presentation");
const Price = require("../Models/Price");
const Offer = require("../Models/Offer");

let eleccionPromoAction = baseAction;

eleccionPromoAction.handleAction = async function(sender, response) {
    let offer7A = Offer;
    let price7A = Price;
    let product7A = Product;
    let album7A = Album;
    let presentation7A = Presentation;
    let offerInfo7A = await offer7A.find({ status: "true" });
    console.log("SOY OOFER  INF===> " + offerInfo7A);
    let card7A = [];
    if (offerInfo7A.length == 0) {
        return baseAction.response(baseAction.codes.TEXT, "Por el momento, no tenemos promociones disponibles");
    }
    for (var i = 0; i < offerInfo7A.length; i++) {
        let offerItem7A = offerInfo7A[i];
        console.log("SOY EL ITEM " + i + "  ==>" + offerItem7A);
        console.log("Soy el ID de Item " + offerItem7A.price);
        let priceInfo7A = await price7A.findOne({ _id: offerItem7A.price });
        let productInfo7A = await product7A.findOne({ _id: priceInfo7A.product });
        let albumInfo7A = await album7A.findOne({ _id: productInfo7A.album });
        let presentationInfo7A = await presentation7A.findOne({ _id: productInfo7A.presentation });
        let itemPrice7A = priceInfo7A.standardPrice - (priceInfo7A.standardPrice * (offerItem7A.discount / 100));

        if (i < 10) {
            card7A.push({
                title: albumInfo7A.name + " - " + albumInfo7A.artist,
                image_url: productInfo7A.image,
                subtitle: "Formato: " + presentationInfo7A.type + "\n" +
                    "Antes: " + "Bs. " + priceInfo7A.standardPrice + "\n" +
                    "Ahora: " + "Bs. " + itemPrice7A,
                buttons: [
                    {
                        type: "postback",
                        title: "Comprar",
                        payload: "DEVELOPER_DEFINED_COMPRAR_ESTADO7A",
                    }
                ]
            },
            );
        }

    }
    return baseAction.response(baseAction.codes.GENERIC, card7A);
}

module.exports = eleccionPromoAction; 
