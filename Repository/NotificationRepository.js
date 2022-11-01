const Notification = require('../Models/Notification');

let notificationRepository = {
    async find(query, many = false,sort,populate) {
        const notification = Notification;

        let result;
        if (many)
            if(sort != null)
                result = await notification.find(query).populate(populate).sort(sort); 
            else
                result = await notification.find(query).populate(populate);
        else
            result = await notification.findOne(query);

        return result;
    },

    async insert(query) {
        const notification = new Notification(query);
        return notification.save();
    },

    async upsert(query, newData) {
        let notification = Notification;

        let result = await notification.findOneAndUpdate(
            query, newData,
            {
                upsert: true,
                new: true,
            }
        );

        return await result.save();
    },
    async count(query){
        let notification = Notification;
        let result = await notification.count(query);

        return result;
    }
}

module.exports = notificationRepository;
