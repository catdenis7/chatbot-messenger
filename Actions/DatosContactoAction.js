const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');
const prospectRepository = require('../Repository/ProspectRepository');
const orderRepository = require('../Repository/OrderRepository');
const contactRepository = require('../Repository/ContactRepository');

let datosContactoAction = {
    async handleAction(sender, response) {
        try {
            if (!response.allRequiredParamsPresent) {
                return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
            }

            let queryBody = {
                "name": response["parameters"]["fields"]["person"]["structValue"]["fields"]["name"]["stringValue"],
                "lastName": response["parameters"]["fields"]["apellido"]["stringValue"],
                "phoneNumber": response["parameters"]["fields"]["phone-number"]["stringValue"],
                "email": response["parameters"]["fields"]["email"]["stringValue"]
            }
            let prospectQuery = await prospectRepository.find({ facebookID: sender });
            let getClient = await clientService.find({ prospect: prospectQuery._id });
            let checkOrder = await orderRepository.find({ client: getClient._id, type: "O", status: "CERRADO" }, true);
            if (checkOrder.length == 0) {
                await clientService.upsert({ prospect: prospectQuery._id }, {
                    type: "C",
                });
                await contactRepository.insert({
                    date: Date.now(),
                    message: "Datos del Cliente Contacto Guardados",
                    client: matchOrder.client,
                    user: null,
                    contactMethod: null,
                });
            } else if (checkOrder.length == 1) {
                await clientService.upsert({ prospect: prospectQuery._id }, {
                    type: "P",
                });
            } else {
                await clientService.upsert({ prospect: prospectQuery._id }, {
                    type: "R",
                });
            }

            let result = await clientService.upsert({ prospect: prospectQuery._id }, queryBody);
            return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = datosContactoAction; 
