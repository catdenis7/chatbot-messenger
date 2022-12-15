const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');
const orderRepository = require('../Repository/OrderRepository');


let ordenPendienteAction = {
    async handleAction(sender, response) {
        try {

            let getProspect = await prospectRepository.find({ facebookID: sender });
            //console.log("SOY GET PROSPECT ===>" + getProspect);
            let getClient = await clientRepository.find({ prospect: getProspect._id });
            //console.log("SOY GET CLIENT ===>" + getClient);
            let searchOrder = await orderRepository.find({ client: getClient._id, type: "C", status: "ABIERTO"});

            let postbackActualizarDatos = {
                "session_id": sender,
                "postback": "DEVELOPER_DEFINED_ACTUALIZAR_INFORMACION"
            }
            let postbackContinuar = {
                "session_id": sender,
                "postback": "DEVELOPER_DEFINED_CONTINUAR"
            }
            let result = {
                text: datosCliente,
                buttons: [
                    {
                        type: "postback",
                        title: "SEGUIR COMPRANDO",
                        payload: JSON.stringify(postbackActualizarDatos),
                    },
                    {
                        type: "postback",
                        title: "VER CARRITO",
                        payload: JSON.stringify(postbackContinuar),
                    },
                ]
            };
            return result;
        } catch (error) {
            console.error(error);
        }
    }
}
module.exports = ordenPendienteAction; 
