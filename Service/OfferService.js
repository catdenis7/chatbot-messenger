let offerRepository = require('../Repository/OfferRepository');

let offerService = {
    async find(query, many = false) {
        return await offerRepository.find(query, many);
    }
}

module.exports = offerService;