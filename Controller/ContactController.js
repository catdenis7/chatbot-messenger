const response = require("express");

let clientService = require('../Service/ClientService');
let contactService = require('../Service/ContactService');

let contactController = {
    async getContacts(req, res) { res.send(await clientService.getContacts(req, res)); },
    async addContact(req, res) { res.send(await contactService.addContact(req, res)); },
    async getContactMethods(req, res) { res.send(await contactService.getContactMethods(req, res)); }
}

module.exports = contactController;
