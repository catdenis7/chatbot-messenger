const Session = require('../Models/Session');

let sessionRepository = {
    async find(query, many = false,sort) {
        const session = Session;

        let result;
        if (many)
            if(sort != null)
                result = await session.find(query).sort(sort);
            else
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
    },
    async count(query){
        let session = Session;
        let result = await session.count(query);

        return result;
    }
}

module.exports = sessionRepository;
