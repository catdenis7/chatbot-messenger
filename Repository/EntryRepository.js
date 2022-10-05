const Entry = require('../Models/Entry');

let entryRepository = {
    async find(query, many = false) {
        const entry = Entry;

        let result;
        if (many)
            result = await entry.find(query);
        else
            result = await entry.findOne(query);

        return result;
    },

    async insert(query) {
        const entry = new Entry(query);
        return entry.save();
    },

    async upsert(query, newData) {
        let entry = Entry;

        let result = await entry.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    }
}

module.exports = entryRepository;
