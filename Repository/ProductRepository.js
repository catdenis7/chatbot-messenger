const Product = require('../Models/Product');

let productRepository = {
    async find(query, many = false,sort) {
        const product = Product;

        let result;
        if (many)
            if(sort != null)
                result = await product.find(query)//.sort(sort);
            else
                result = await product.find(query);
        else
            result = await product.findOne(query);

        return result;
    },

    async insert(query) {
        const product = new Product(query);
        return product.save();
    },

    async upsert(query, newData) {
        let product = Product;

        let result = await product.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let product = Product;
        let result = await product.count(query);

        return result;
    }
}

module.exports = productRepository;
