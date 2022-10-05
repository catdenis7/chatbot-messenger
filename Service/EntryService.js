const Entry = require('../Models/Entry');
let entryRepository = require('../Repository/EntryRepository');
let prospectRepository = require('../Repository/ProspectRepository.js');
let entryService = {

    async find(query, many = false) {
        return await entryRepository.find(query, many = many);
    },

    async insert(query) {
        return await entryRepository.insert(query);
    },

    async upsert(query, newData) {
        return await entryRepository.upsert(query, newData);
    },

    async addEntry(facebookId, productModel) {
        let prospect = await prospectRepository.find({ facebookID: facebookId });
        let body = {
            "prospect": prospect,
            "product": productModel,
            "date": Date.now()
        };
        return await entryRepository.insert(body);
    }
}

module.exports = entryService;
