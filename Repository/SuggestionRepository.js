const Suggestion = require('../Models/Suggestion');

let suggestionRepository = {
    async find(query, many = false) {
        const suggestion = Suggestion;

        let result;
        if(many) 
            result = await suggestion.find(query);
        else
            result = await suggestion.finOne(query);

        return result;
    },

    async insert(query) {
        const suggestion = new Suggestion(query);
        return suggestion.save();
    },

    async upsert(query, newData) {
        let suggestion = Suggestion;

        let result = await suggestion.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    }
}

module.exports = suggestionRepository;