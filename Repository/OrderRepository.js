const Order = require('../Models/Order');

let orderRepository = {
    async find(query, many = false,sort) {
        const order = Order;

        let result;
        if (many)
            if(sort != null)
                result = await order.find(query).sort(sort);
            else
                result = await order.find(query);
        else
            result = await order.findOne(query);

        return result;
    },

    async insert(query) {
        const order = new Order(query);
        return order.save();
    },

    async upsert(query, newData) {
        let order = Order;

        let result = await order.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let order = Order;
        let result = await order.count(query);

        return result;
    }
}

module.exports = orderRepository;
