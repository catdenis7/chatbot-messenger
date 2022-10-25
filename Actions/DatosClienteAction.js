const baseAction = require('./BaseAction');
const clientService = require('../Service/ClientService');
const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');
const orderRepository = require('../Repository/OrderRepository');

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
        let getProspect = await prospectRepository.find({facebookID: sender});
        //console.log("SOY GET PROSPECT ===>" + getProspect);
        let getClient = await clientRepository.find({prospect: getProspect._id});
        let matchOrder = await orderRepository.find({client: getClient._id, type: "O"});
        if (matchOrder != null){
            let clientUpdate = await clientRepository.upsert({ _id : matchOrder.client}, {
                name: queryBody.name,
                lastName: queryBody.lastName,
                phoneNumber: queryBody.phoneNumber, 
                email: queryBody.email,
                type: "C",            
            });
        }
        /*
        let result = {
            'image' : "https://img.freepik.com/vector-premium/icono-vector-muestra-codigo-qr-aislado-sobre-fondo-blanco_125869-2252.jpg?w=2000",
            'text' : "Escanee el siguiente QR para realizar el pago de su pedido y envíenos el comprobante de pago. Le notificaremos cuando la transacción haya sido completada.",
        } 
        
        return result;
        */
        return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    }
}
}

module.exports = datosClienteAction; 
