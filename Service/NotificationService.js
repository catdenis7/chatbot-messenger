const axios = require('axios');
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
            const { image } = req.files;
            const fileName = image.name + Date.now();
            let result = {
                discount: data.discount,
                title: data.title,
                description: data.description,
                date: Date.now(),
                status: true,
                fromDate: data.fromDate,
                toDate: data.toDate,
                image: fileName, 
            }
            image.mv(__dirname + '/media/' + fileName);

            await offerRepository.insert(result);
            //TODO: Asignar Productos
            return fileName;
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            return { "error": error }
        }
    },

    async getClientEmail(req, res) {
        let client = await clientRepository.find({}, true);
        let clientEmail = [];
        for (let index = 0; index < client.length; index++) {
            const element = client[index];
            if (element.email != null) {
                clientEmail.push({
                    'email' : element.email,
                    'name' : element.name,
                });

                await notificationRepository.insert({
                    date: Date.now(),
                    subject: data.title,
                    message: data.description,
                    client: element._id,
                })
            }
        }
        return clientEmail;
    },


    async sendEmail(image, title, payload) {
        try {
            let result = await axios({
                url: 'https://api.eu1.robocorp.com/process-v1/workspaces/48a6a488-49ab-43d8-bd66-08fdaac243e3/processes/bb34827b-785f-464b-961d-adb2ea28698f/runs',
                method: 'POST',
                data: {
                    image: image,
                    title: title,
                    payload : payload
                }
            });
            return result;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}

module.exports = notificationService;
