const response = require("express");

let clientService = require('../Service/ClientService');

let clientController = {
    async getCards(req, res) {
        let result = await clientService.getCards(req, res);
        res.send(result);
    },
    async notification(req, res) {
        try {
            await clientService.notification(req, res);
        }
        catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.send(error);
        }
    },
    async getPersonalData(req, res) {
        let result = await clientService.getPersonalData(req, res);
        res.send(result);
    }

}

module.exports = clientController;
