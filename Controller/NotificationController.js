const response = require("express");

let notificationService = require('../Service/NotificationService');

let notificationController = {
    async getNotifications(req, res) {
        res.send(await notificationService.getNotifications(req,res));
    },
    async sendEmail(req, res) {
        //let result = await this.addPromo(req, res);
        //res.send(await notificationService.sendEmail(result,res));
        res.send(await notificationService.sendEmail(req,res));
    },

    async addPromo(req, res) {
        try {
        let result = res.send(await notificationService.addPromo(req, res));
        res.send(await notificationService.sendEmail(result,res));
        } catch(err) {
            return [];
        }
    },
}
module.exports = notificationController;
