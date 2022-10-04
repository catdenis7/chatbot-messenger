const Session = require('../Models/Session');
let sessionRepository = require('../Repository/SessionRepository');
let sessionService = {

    async find(query, many = false) {
        return await sessionRepository.find(query, many = many);
    },

    async insert(query) {
        return await sessionRepository.insert(query);
    },

    async upsert(query, newData) {
        return await sessionRepository.upsert(query, newData);
    }


}

module.exports = sessionService;
