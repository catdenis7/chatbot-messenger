const Price = require('../Models/Price');

let priceRepository = {
    async find(query, many = false,sort) {
        const price = Price;

        let result;
        if (many)
            if(sort != null)
                result = await price.find(query).sort(sort);
            else
                result = await price.find(query);
        else
            result = await price.findOne(query);

        return result;
    },

    async insert(query) {
        const price = new Price(query);
        return price.save();
    },

    async upsert(query, newData) {
        let price = Price;

        let result = await price.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let price = Price;
        let result = await price.count(query);

        return result;
    }
}

module.exports = priceRepository;
