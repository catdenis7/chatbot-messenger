const response = require("express");

let prospectService = require('../Service/ProspectService');

let prospectController = {
    async addContact(req, res) { res.send(await prospectService.addContact(req, res)); },
}

module.exports = prospectController;
