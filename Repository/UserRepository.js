const User = require('../Models/User');

let userRepository = {
    async find(query, many = false,sort,populate) {
        const user = User;

        let result;
        if (many)
            if(sort != null)
                result = await user.find(query).populate(populate).sort(sort); 
            else
                result = await user.find(query).populate(populate);
        else
            result = await user.findOne(query);

        return result;
    },

    async insert(query) {
        const user = new User(query);
        return user.save();
    },

    async upsert(query, newData) {
        let user = User;

        let result = await user.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let user = User;
        let result = await user.count(query);

        return result;
    }
}

module.exports = userRepository;
