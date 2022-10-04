const Session = require('../Models/Session');

let sessionRepository = {
    async find(query, many = false) {
        const session = Session;

        let result;
        if (many)
            result = await session.find(query);
        else
            result = await session.findOne(query);

        return result;
    },

    async insert(query) {
        const session = new Session(query);
        return session.save();
    },

    async upsert(query, newData) {
        let session = Session;

        let result = await session.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    }
}

module.exports = sessionRepository;
