const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');

let datosClienteAction = {async handleAction(sender, response) {
    console.log("SOY DATOS CLIENTE");
    console.log("PARAMETERS => ");
    console.log(JSON.stringify(response.parameters));

    if (!response.allRequiredParamsPresent) {
        return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    }
    else {
        let queryBody = {
            "name": response["parameters"]["fields"]["person"]["structValue"]["fields"]["name"]["stringValue"],
            "lastName": response["parameters"]["fields"]["apellido"]["stringValue"],
            "phoneNumber": response["parameters"]["fields"]["phone-number"]["stringValue"],
            "email": response["parameters"]["fields"]["email"]["stringValue"]
        }
        let prospectQuery = {
            "facebookID": sender
        }

        let result = await clientService.insert(prospectQuery, queryBody);

        return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);

    }
}
}

module.exports = datosClienteAction; 
