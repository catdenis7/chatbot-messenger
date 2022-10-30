const response = require("express");

let clientService = require('../Service/ClientService');

let contactController = {
    async getContacts(req, res) { res.send(await clientService.getContacts(req, res)); },
}

module.exports = contactController;
