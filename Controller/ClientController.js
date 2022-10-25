const response = require("express");

let clientService = require('../Service/ClientService');
let clientController = {
    async getCards(req, res){
        let result = await clientService.getCards(req, res);
        res.send(result);
    }    
}

module.exports = clientController;
