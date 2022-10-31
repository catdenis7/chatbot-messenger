const clientRepository = require("../Repository/ClientRepository");
const contactRepository = require("../Repository/ContactRepository");

let contactService = {
    async addContact(req, res) {
        try {
            let data = req.body;
            let result = await contactRepository.insert({
                date: data.date,
                message: data.message,
                response: data.response,
                client: data.clientId,
                contactMethod: data.contactMethod,
                user: data.user,
            });
            let client = await clientRepository.find({ _id: data.clientId, type: { $nin: ["P", "C", "R"] } });
            if (client != null) {
                client.type = "C";
                await client.save();
            }
            return result;
        } catch (error) {
            res.statusCode = 500;
            return {"error" : error}
        }
    }
}

module.exports = contactService;
