const Entry = require('../Models/Entry');
const { default: Suggestion }=require('../Models/Suggestion.js');
let entryRepository = require('../Repository/EntryRepository');
let prospectRepository = require('../Repository/ProspectRepository.js');
const sessionService = require('./SessionService');
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

    async addEntry(sessionId, productModel, suggestionBody,) {
        let session = await sessionService.find({ sessionID: sessionId });
        let suggestion = null; 
        if(suggestionBody != null){
            // TODO: Insertar Sugerencia por repositorio
            suggestion = await Suggestion.insert(suggestionBody);
        }
        let body = {
            "session": session,
            "product": productModel,
            "suggestion": suggestion, 
            "date": Date.now()
        };
        return await entryRepository.insert(body);
    }
}

module.exports = entryService;
