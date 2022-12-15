const response = require("express");
const messengerService = require("../Service/MessengerService");

let notificationService = require('../Service/NotificationService');

let notificationController = {
    async getNotifications(req, res) {
        res.send(await notificationService.getNotifications(req, res));
    },
    async sendEmail(req, res) {
        //let result = await this.addPromo(req, res);
        //res.send(await notificationService.sendEmail(result,res));
        res.send(await notificationService.sendEmail(req, res));
    },

    async addPromo(req, res) {
        try {
            let imagePath = await notificationService.addPromo(req, res);
            let photoUrl = 'https://renatoalvarezdev.com/media/' + imagePath; 
            let facebookMessage = req.body.title +'\n'+ req.body.description;

            let emailResult = await notificationService.sendEmail(photoUrl, req.body.title, req.body.description);
            let facebookResult = await messengerService.postToFeed(photoUrl,facebookMessage);

            res.send('Ok');
        } catch (err) {
            res.send(err);
        }
    },
}
module.exports = notificationController;
