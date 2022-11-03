const Prospect = require('../Models/Prospect');
let prospectRepository = require('../Repository/ProspectRepository');
let contactRepository = require('../Repository/ContactRepository');
let clientRepository = require('../Repository/ClientRepository');
let prospectService = {

    async find(query, many = false) {
        return await prospectRepository.find(query, many = many);
    },

    async insert(query) {
        return await prospectRepository.insert(query);
    },

    async upsert(query, newData) {
        return await prospectRepository.upsert(query, newData);
    },

    async addContact(req, res) {
        try {
            let data = req.body;
            let clientResult = await clientRepository.insert({
                name: data.name,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                email: data.email,
                type: "C",
                prospect: data.prospectId,
            });
            let findClient = await clientRepository.find({prospect: data.prospectId});
            let contactResult = await contactRepository.insert({
                date: data.date,
                message: data.message,
                response: data.response,
                client: findClient._id,
                contactMethod: data.contactMethod,
                user: data.user,
            });

            let result = clientResult + contactResult;
            return result;
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            return { "error": error }
        }
    },
}

module.exports = prospectService;
