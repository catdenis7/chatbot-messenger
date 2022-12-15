const Offer = require('../Models/Offer');

let offerRepository = {
    async find(query, many = false, sort, populate) {
        const offer = Offer;

        let result;
        if (many)
            if(sort != null)
                result = await offer.find(query).populate(populate).sort(sort); 
            else
                result = await offer.find(query).populate(populate);
        else
            result = await offer.findOne(query);

        return result;
    },

    async insert(query) {
        const offer = new Offer(query);
        return offer.save();
    },

    async upsert(query, newData) {
        let offer = Offer;

        let result = await offer.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let offer = Offer;
        let result = await offer.count(query);

        return result;
    }
}

module.exports = offerRepository;
