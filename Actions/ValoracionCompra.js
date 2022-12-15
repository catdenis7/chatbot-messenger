const baseAction = require('./BaseAction');
const sessionService = require('../Service/SessionService');

let valoracionCompraAction = {
    async handleAction(sender, response) {
        try {
            if (response.allRequiredParamsPresent) {
                let queryBody = {
                    "number": response["parameters"]["fields"]["number"]["numberValue"],
                }

                console.log("who am i ===> " + sender);
                sessionService.upsert({ sessionID: sender }, {
                    score: queryBody.number,
                    endDate: Date.now(),
                });
                console.log("SI FUNCA ESTADO 10: VALORACION COMPRA");
                return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
            } else {
                return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
            }
        } catch (error) {
            console.error(error);
        }
    }
}
module.exports = valoracionCompraAction; 
