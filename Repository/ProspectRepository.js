const Prospect = require('../Models/Prospect');

let prospectRepository = {
    async find(query, many = false) {
        const prospect = Prospect;

        let result;
        if (many)
            result = await prospect.find(query);
        else
            result = await prospect.findOne(query);

        return result;
    },

    async insert(query) {
        const prospect = new Prospect(query);
        return prospect.save();
    },

    async upsert(query, newData) {
        let prospect = Prospect;

        let result = await prospect.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    }
}

module.exports = prospectRepository;
