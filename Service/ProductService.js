const Album = require("../Models/Album");
const Presentation = require("../Models/Presentation");
const productRepository = require("../Repository/ProductRepository");

let productService = {

    async getName(productId){
        let product = await productRepository.find({_id : productId});
        let album = await Album.findOne({_id : product.album});
        let presentation = await Presentation.findOne({_id : product.presentation});
        return album.artist + " - " + album.name + " - " + presentation.type
    },

    async find(query, many = false) {
        return await productRepository.find(query, many);    
    }
}

module.exports = productService;
