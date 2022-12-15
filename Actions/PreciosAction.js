const baseAction = require('./BaseAction');

const productRepository = require("../Repository/ProductRepository");
const priceRepository = require("../Repository/PriceRepository");

const Album = require("../Models/Album");
const Presentation = require("../Models/Presentation");
const Offer = require("../Models/Offer");
const Price = require("../Models/Price");

let preciosAction = {
    async handleAction(sender, response) {
        try {
            let priceModel = Price;
            let getPrecios = priceModel.find({});
            let precio = "Precio: ";
            for (var i = 0; i < getPrecios.length; i++) {
                let precioItem = getPrecios[i];
                precio = precio + "Precio " + precioItem+ "\n";
            };
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = preciosAction; 
