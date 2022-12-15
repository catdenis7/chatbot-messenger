
let productService = require('../Service/ProductService');


let productController = {
    async getProducts(req, res) {
        try {
            res.send(await productService.find({}, true));
        } catch(err) {
            res.statusCode = 500;
            res.send([]);
            console.log(err);
        };
    }
}

module.exports = productController;