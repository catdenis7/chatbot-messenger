const baseAction = require('./BaseAction');

const productRepository = require("../Repository/ProductRepository");
const priceRepository = require("../Repository/PriceRepository");

const Album = require("../Models/Album");
const Presentation = require("../Models/Presentation");
const Offer = require("../Models/Offer");

let productosArtistaAction = {
    async handleAction(sender, response) {
        try {
            if (response.allRequiredParamsPresent) {
                let offerModel = Offer;
                let albumModel = Album;
                let presentationModel = Presentation;
                let itemPrice;

                let artist = response["parameters"]["fields"]["artista"]["stringValue"];

                let albumInfo = await albumModel.find({ artist: artist });
                if (albumInfo.length == 0) {
                    return baseAction.response(baseAction.codes.TEXT, "Disculpa, pero no tenemos productos de " + albumInfo.artist + ". Puede proporcionarnos sus datos para que le notifiquemos cuando tengamos albumes de ese artista. ¿Cual es su nombre? 😄");
                }

                let card = [];
                let counter = 0;
                for (var j = 0; j < albumInfo.length; j++) {

                    let albumItem = albumInfo[j];
                    let product = await productRepository.find({ album: albumItem._id }, true);

                    for (var i = 0; i < product.length; i++) {
                        let productItem = product[i];

                        let album = await albumModel.findOne({ _id: productItem.album });
                        let presentation = await presentationModel.findOne({ _id: productItem.presentation });
                        let price = await priceRepository.find({ _id: productItem.price });

                        if (price.offer == null) {
                            itemPrice = price.basePrice;
                            await priceRepository.upsert({ _id: price._id }, {
                                salesPrice: itemPrice,
                            });
                        } else {
                            let offer = await offerModel.findOne({ _id: price.offer });
                            if (offer.status) {
                                itemPrice = price.basePrice - (price.basePrice * (offer.discount / 100));
                                console.log("SOY EL PRECIO DEL DESCUENTO ===>" + itemPrice);
                                await priceRepository.upsert({ _id: price._id }, {
                                    salesPrice: itemPrice,
                                });
                                console.log("PRICE DESCUENTO => " + price.salesPrice);
                            } else {
                                itemPrice = price.basePrice;
                                await priceRepository.upsert({ _id: price._id }, {
                                    salesPrice: itemPrice,
                                });
                            }
                        }

                        if (counter <= 10) {
                            let postbackInfo = {
                                "product_id": productItem._id,
                                "session_id": sender,
                                "postback": "DEVELOPER_DEFINED_CARRITO_ARTISTA"
                            }
                            card.push({
                                title: album.name + " - " + album.artist,
                                image_url: productItem.image,
                                subtitle: "Formato: " + presentation.type + "\n" + "Bs. " + itemPrice,
                                buttons: [
                                    {
                                        type: "postback",
                                        title: "AÑADIR AL CARRITO",
                                        payload: JSON.stringify(postbackInfo),
                                    }
                                ]
                            },
                            );
                            counter++;
                        }

                    }
                }
                return baseAction.response(baseAction.codes.GENERIC, card);
            }
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = productosArtistaAction; 
