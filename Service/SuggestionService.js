const Suggestion = require('../Models/Suggestion');
let suggestionRepository = require('../Repository/SuggestionRepository');



let suggestionService = {
    async find(query, many = false) {
        return await suggestionRepository.find(query, many);
    },

    async insert(query) {
        return await suggestionRepository.insert(query);
    },

    async upsert(query, newData) {
        return await suggestionRepository.upsert(query, newData);
    }
}

module.exports = suggestionService;