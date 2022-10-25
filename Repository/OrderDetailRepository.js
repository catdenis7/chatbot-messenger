const OrderDetail = require('../Models/OrderDetail');

let orderDetailRepository = {
    async find(query, many = false,sort) {
        const orderDetail = OrderDetail;

        let result;
        if (many)
            if(sort != null)
                result = await orderDetail.find(query)//.sort(sort);
            else
                result = await orderDetail.find(query);
        else
            result = await orderDetail.findOne(query);

        return result;
    },

    async insert(query) {
        const orderDetail = new OrderDetail(query);
        return orderDetail.save();
    },

    async upsert(query, newData) {
        let orderDetail = OrderDetail;

        let result = await orderDetail.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let orderDetail = OrderDetail;
        let result = await orderDetail.count(query);

        return result;
    }
}

module.exports = orderDetailRepository;
