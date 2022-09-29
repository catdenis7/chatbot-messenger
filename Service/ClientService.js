let clientRepository = require('../Repository/ClientRepository');
let prospectRepository = require('../Repository/ProspectRepository');
let clientService = {

    async find(query, many = false) {
        return await clientRepository.find(query, many = many);
    },

    async insert(prospectQuery, query) {
        let prospect = await prospectRepository.find(prospectQuery);
        query['prospect'] = prospect;
        return await clientRepository.insert(query);
    },

    async upsert(query, newData) {
        return await clientRepository.upsert(query, newData);
    }
}

module.exports = clientService;
