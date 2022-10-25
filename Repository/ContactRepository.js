const Contact = require('../Models/Contact');

let contactRepository = {
    async find(query, many = false,sort) {
        const contact = Contact;

        let result;
        if (many)
            if(sort != null)
                result = await contact.find(query)//.sort(sort);
            else
                result = await contact.find(query);
        else
            result = await contact.findOne(query);

        return result;
    },

    async insert(query) {
        const contact = new Contact(query);
        return contact.save();
    },

    async upsert(query, newData) {
        let contact = Contact;

        let result = await contact.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let contact = Contact;
        let result = await contact.count(query);

        return result;
    }
}

module.exports = contactRepository;
