const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');
const ProspectRepository = require('../Repository/ProspectRepository');
const prospectRepository = require('../Repository/ProspectRepository');

let datosContactoAction = {async handleAction(sender, response) {

    console.log("PARAMETERS => ");
    console.log("SENDER ESTADO 14: ====> "+sender);
    console.log(JSON.stringify(response.parameters));

    if (!response.allRequiredParamsPresent) {
        return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    }

    let queryBody = {
        "name": response["parameters"]["fields"]["person"]["structValue"]["fields"]["name"]["stringValue"],
        "lastName": response["parameters"]["fields"]["apellido"]["stringValue"],
        "phoneNumber": response["parameters"]["fields"]["phone-number"]["stringValue"],
        "email": response["parameters"]["fields"]["email"]["stringValue"]
    }
    let prospectQuery = await prospectRepository.find({facebookID: sender});

    let result = await clientService.upsert({prospect: prospectQuery._id}, queryBody);
    return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
}
}

module.exports = datosContactoAction; 
