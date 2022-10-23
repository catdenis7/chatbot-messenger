const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');
const Prospect = require("../Models/Prospect");

let valoracionCompraAction = baseAction;

valoracionCompraAction.handleAction = async function(sender, response) {
    if (response.allRequiredParamsPresent) {
        let queryBody = {
            "number": response["parameters"]["fields"]["number"]["numberValue"],
        }
        let prospect = Prospect;

        let prospectInfo = await prospect.findOne({ $facebookID: sender });
        sessionService.upsert({ sessionID: sessionIDs.get(sender) }, {
            score: queryBody.number,
            endDate: Date.now(),
        });
        console.log("SI FUNCA V1");
        return await baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    } else {
        return await baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    }

}

module.exports = valoracionCompraAction; 
