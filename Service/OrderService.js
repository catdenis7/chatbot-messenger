const Order = require('../Models/Order');
let Suggestion = require('../Models/Suggestion');
let orderRepository = require('../Repository/OrderRepository');
let prospectRepository = require('../Repository/ProspectRepository.js');
const sessionService = require('./SessionService');
const productRepository = require('../Repository/ProductRepository');
const { getOrders } = require('../Controller/OrderController');
const orderDetailRepository = require('../Repository/OrderDetailRepository');
const productService = require('./ProductService');

let orderService = {

    async find(query, many = false) {
        return await orderRepository.find(query, many = many);
    },

    async insert(query) {
        return await orderRepository.insert(query);
    },

    async upsert(query, newData) {
        return await orderRepository.upsert(query, newData);
    },

    async getOrders(req, res) {
        console.log("Getting Orders")
        let clientId = req.body.clientId;
        console.log(clientId);
        let orders = this.toJson(await orderRepository.find({ client: clientId }, true));

        console.log(orders)
        let result = [];
        for (let index = 0; index < orders.length; index++) {
            let order = orders[index];
            let orderLines = this.toJson(await orderDetailRepository.find({ order: order._id }, true));
            let orderLine = [];

            let orderQuantity = 0;

            for (let jindex = 0; jindex < orderLines.length; jindex++) {
                let line = orderLines[jindex];
                orderQuantity += line.quantity;
                
                let productName = await productService.getName(line.product);
                orderLine.push({
                    'quantity': line.quantity,
                    'product' : productName,
                    'price' : line.productPrice,
                    'total' : line.detailTotal
                });
            }
            result.push({
                'date' : order.date,
                'orderQuantity' : orderQuantity,
                'total' : order.total,
                'lines' : orderLine,
            })
        }

        return result;
    },

    toJson(document) {
        return JSON.parse(JSON.stringify(document));
    },
}

module.exports = orderService;
