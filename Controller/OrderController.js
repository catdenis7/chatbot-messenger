const response = require("express");

let orderService = require('../Service/OrderService');
let orderController = {
    async getOrders(req, res){
        let result = await orderService.getOrders(req, res);
        res.send(result);
    }    
}

module.exports = orderController;
