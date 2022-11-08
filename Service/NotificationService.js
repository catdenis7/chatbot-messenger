let notificationRepository = require('../Repository/NotificationRepository');
let notificationService = {

    async find(query, many = false) {
        return await notificationRepository.find(query, many = many);
    },

    async insert(prospectQuery, query) {
        let prospect = await prospectRepository.find(prospectQuery);
        query['prospect'] = prospect;
        return await notificationRepository.insert(query);
    },

    async upsert(query, newData) {
        return await notificationRepository.upsert(query, newData);
    },

    async  getNotifications(req, res) {
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
}

module.exports = notificationService;
