const baseAction = require('./BaseAction');
const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');
const orderRepository = require('../Repository/OrderRepository');
const orderDetailRepository = require('../Repository/OrderDetailRepository');


let ordenPendienteAction = {
    async handleAction(sender, response) {
        try {

            let getProspect = await prospectRepository.find({ facebookID: sender });
            //console.log("SOY GET PROSPECT ===>" + getProspect);
            let getClient = await clientRepository.find({ prospect: getProspect._id });
            //console.log("SOY GET CLIENT ===>" + getClient);
            let searchOrder = await orderRepository.find({ client: getClient._id, type: "C", status: "ABIERTO" });
            if (searchOrder != null){
                let getOrderDetails = await orderDetailRepository.find({
                    order: searchOrder._id, quantity: { $ne: null },
                    productPrice: { $ne: null }, detailTotal: { $ne: null }
                }, true);
                console.log("ORDER DETAILS: ===>"+ getOrderDetails);
    
                if (getOrderDetails.length == 0) {
    
                    let postbackNegativo = "Lamentamos no poder ayudarte con lo que necesitas. Por favor, en una escala del 1 al 5 (siendo 1 calificación muy baja y 5 la calificación excelente) ¿qué le pareció la atención recibida hasta el momento?";
                    return baseAction.response(baseAction.codes.TEXT, postbackNegativo);
                }
            } else {
                let postbackNegativo = "Lamentamos no poder ayudarte con lo que necesitas. Por favor, en una escala del 1 al 5 (siendo 1 calificación muy baja y 5 la calificación excelente) ¿qué le pareció la atención recibida hasta el momento?";
                return baseAction.response(baseAction.codes.TEXT, postbackNegativo);
            }
            

            let postbackSeguirComprando = {
                "session_id": sender,
                "postback": "DEVELOPER_DEFINED_SEGUIR_COMPRANDO"
            }
            let postbackVerCarrito = {
                "session_id": sender,
                "postback": "DEVELOPER_DEFINED_VER_CARRITO"
            }
            let result = {
                text: "Hemos visto que aun tiene producto (s) en su carrito.",
                buttons: [
                    {
                        type: "postback",
                        title: "SEGUIR COMPRANDO",
                        payload: JSON.stringify(postbackSeguirComprando),
                    },
                    {
                        type: "postback",
                        title: "VER CARRITO",
                        payload: JSON.stringify(postbackVerCarrito),
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
