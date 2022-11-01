const response = require("express");

let notificationService = require('../Service/NotificationService');

let notificationController = {
    async getNotifications(req, res){
        res.send(await notificationService.getNotifications(req,res));
    }

}

module.exports = notificationController;
