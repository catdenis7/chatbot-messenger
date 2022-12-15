
let offerService = require('../Service/OfferService');


let offerController = {
    async getPromo(req, res) {
        try {
            res.send(await offerService.find({}, true));
        } catch(err) {
            res.statusCode = 500;
            res.send([]);
            console.log(err);
        };
    }
}

module.exports = offerController;