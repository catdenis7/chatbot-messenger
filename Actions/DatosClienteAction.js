const baseAction = require('./BaseAction');
const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');
const orderRepository = require('../Repository/OrderRepository');
const contactRepository = require('../Repository/ContactRepository');

let datosClienteAction = {
    async handleAction(sender, response) {
        try {
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

                let getProspect = await prospectRepository.find({ facebookID: sender });
                //console.log("SOY GET PROSPECT ===>" + getProspect);
                let getClient = await clientRepository.find({ prospect: getProspect._id });
                let matchOrder = await orderRepository.find({ client: getClient._id, type: "O", status: "ABIERTO" });
                if (matchOrder != null) {
                    await clientRepository.upsert({ _id: matchOrder.client }, {
                        name: queryBody.name,
                        lastName: queryBody.lastName,
                        phoneNumber: queryBody.phoneNumber,
                        email: queryBody.email,
                    });
                    let typeClient = await orderRepository.find({ client: getClient._id, type: "O", status: "CERRADO" }, true);
                    if (typeClient.length == 0) {
                        await clientRepository.upsert({ _id: matchOrder.client }, {
                            type: "C",
                        });
                        await contactRepository.insert({
                            date: Date.now(),
                            message: "Datos del Cliente Contacto Guardados",
                            client: matchOrder.client,
                            user: null,
                            contactMethod: null,
                        });
                    } else if (typeClient.length == 1) {
                        await clientRepository.upsert({ _id: matchOrder.client }, {
                            type: "P",
                        });
                    } else {
                        await clientRepository.upsert({ _id: matchOrder.client }, {
                            type: "R",
                        });
                    }
                }

                let result = {
                    'image': "https://img.freepik.com/vector-premium/icono-vector-muestra-codigo-qr-aislado-sobre-fondo-blanco_125869-2252.jpg?w=2000",
                    'text': "Escanee el siguiente QR para realizar el pago de su pedido y envíenos el comprobante de pago. Le notificaremos cuando la transacción haya sido completada.",
                }

                return result;
            }
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = datosClienteAction; 
