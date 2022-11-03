const Person = require('../Models/Person');

let personRepository = {
    async find(query, many = false,sort,populate) {
        const person = Person;

        let result;
        if (many)
            if(sort != null)
                result = await person.find(query).populate(populate).sort(sort); 
            else
                result = await person.find(query).populate(populate);
        else
            result = await person.findOne(query);

        return result;
    },

    async insert(query) {
        const person = new Person(query);
        return person.save();
    },

    async upsert(query, newData) {
        let person = Person;

        let result = await person.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let person = Person;
        let result = await person.count(query);

        return result;
    }
}

module.exports = personRepository;
