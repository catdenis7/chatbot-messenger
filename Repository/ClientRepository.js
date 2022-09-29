const Client = require('../Models/Client');

let clientRepository = {
    async find(query, many = false) {
        const client = Client;

        let result;
        if (many)
            result = await client.find(query);
        else
            result = await client.findOne(query);

        return result;
    },

    async insert(query) {
        const client = new Client(query);
        return client.save();
    },

    async upsert(query, newData) {
        let client = Client;

        let result = await client.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    }
}

module.exports = clientRepository;
