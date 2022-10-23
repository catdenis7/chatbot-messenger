import { response } from './BaseAction.js';

const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');

let compraPromocionesAction = baseAction;

compraPromocionesAction.handleAction = async function(sender, response) {

    console.log("PARAMETERS => ");
    console.log(JSON.stringify(response.parameters));

    if (!response.allRequiredParamsPresent) 
        return baseAction.response(baseAction.codes.TEXT,response.fulfillmentText);
    else {
        let queryBody = {
            "name": response["parameters"]["fields"]["nombre"]["stringValue"],
            "lastName": response["parameters"]["fields"]["apellido"]["stringValue"],
            "phoneNumber": response["parameters"]["fields"]["phone_number"]["stringValue"],
            "email": response["parameters"]["fields"]["email"]["stringValue"]
        }
        let prospectQuery = {
            "facebookID": sender
        }
        await clientService.insert(prospectQuery, queryBody);
        return baseAction.response(baseAction.codes.TEXT,response.fulfillmentText);
    }
}

module.exports = compraPromocionesAction; 
