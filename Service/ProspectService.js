const Prospect = require('../Models/Prospect');
let prospectRepository = require('../Repository/ProspectRepository');
let prospectService = {

    async find(query, many = false) {
        return await prospectRepository.find(query, many = many);
    },

    async insert(query) {
        return await prospectRepository.insert(query);
    },

    async upsert(query, newData) {
        return await prospectRepository.upsert(query, newData);
    }
}

module.exports = prospectService;
