let notificationRepository = require('../Repository/NotificationRepository');
let clientRepository = require('../Repository/ClientRepository');
let offerRepository = require('../Repository/OfferRepository');
let notificationService = {

    async find(query, many = false) {
        return await notificationRepository.find(query, true);
    },

    async insert(prospectQuery, query) {
        let prospect = await prospectRepository.find(prospectQuery);
        query['prospect'] = prospect;
        return await notificationRepository.insert(query);
    },

    async upsert(query, newData) {
        return await notificationRepository.upsert(query, newData);
    },

    async getNotifications(req, res) {
        try {
            let clientId = req.body.clientId;
            return this.toJson(await notificationRepository.find({ client: clientId }, true))
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            return [];
        }
    },

    toJson(document) {
        return JSON.parse(JSON.stringify(document));
    },

    async addPromo(req, res) {
        try {
            let data = req.body;
            let result = {
                discount: data.discount,
                title: data.title,
                description: data.description,
                date: Date.now(),
                status: true,
                fromDate: data.fromDate,
                toDate: data.toDate,
                image: data.image
            }
            
            await offerRepository.insert(result);
            let client = await clientRepository.find({}, true);
            for (let index = 0; index < client.length; index++) {
                const element = client[index]._id;
                await notificationRepository.insert({
                    date: Date.now(),
                    subject: data.title,
                    message: data.description,
                    client: element,
                })
            }
            return result;
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            return { "error": error }
        }
    },

    async getClientEmail() {
        let client = await clientRepository.find({}, true);
        let clientEmail = [];
        /*
        for (let index = 0; index < client.length; index++) {
            const element = client[index];
            if (element.email != null) {
                clientEmail.push(element.email);
            }
        }
        */
        clientEmail.push('velaryones@gmail.com');
        return clientEmail;

    },


    async sendEmail(req, res) {
        try {
            let data = req.body;
            let clientEmails = await this.getClientEmail();
            let content = {
                'email': clientEmails,
                'subject': "data.title",
                'message': "data.description",
            }
            return content;
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            return [];
        }
    }
}

module.exports = notificationService;
