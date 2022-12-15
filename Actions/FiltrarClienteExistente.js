const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');


let filtrarClienteExistenteAction = {
    async handleAction(sender, response) {
        try {

            let getProspect = await prospectRepository.find({ facebookID: sender });
            //console.log("SOY GET PROSPECT ===>" + getProspect);
            let getClient = await clientRepository.find({ prospect: getProspect._id });
            //console.log("SOY GET CLIENT ===>" + getClient);
            let datosCliente = "Al parecer, ya tenemos tus datos!  Deseas actualizarlos? \n" +
                "Nombre: " + getClient.name + "\n" +
                "Apellido: " + getClient.lastName + "\n" +
                "Email : " + getClient.email + "\n" +
                "Teléfono: " + getClient.phoneNumber;

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
                        title: "ACTUALIZAR DATOS",
                        payload: JSON.stringify(postbackActualizarDatos),
                    },
                    {
                        type: "postback",
                        title: "CONTINUAR CON MI COMPRA",
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
module.exports = filtrarClienteExistenteAction; 
