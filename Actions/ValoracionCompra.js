const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');
const Prospect = require("../Models/Prospect");

let valoracionCompraAction = {async handleAction(sender, response) {
    if (response.allRequiredParamsPresent) {
        let queryBody = {
            "number": response["parameters"]["fields"]["number"]["numberValue"],
        }
        let prospect = Prospect;

        let prospectInfo = await prospect.findOne({ $facebookID: sender });
        sessionService.upsert({ sessionID: sender}, {
            score: queryBody.number,
            endDate: Date.now(),
        });
        console.log("SI FUNCA ESTADO 10: VALORACION COMPRA");
        return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    } else {
        return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    }

}
}
module.exports = valoracionCompraAction; 
