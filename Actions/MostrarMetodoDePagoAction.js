
const baseAction = require('./BaseAction');
const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');


let mostrarMetodoDePagoAction = {
    async handleAction(sender, response) {
        let result = {
            'image' : "https://img.freepik.com/vector-premium/icono-vector-muestra-codigo-qr-aislado-sobre-fondo-blanco_125869-2252.jpg?w=2000",
            'text' : "Escanee el siguiente QR para realizar el pago de su pedido y envíenos el comprobante de pago. Le notificaremos cuando la transacción haya sido completada.",
        } 
        return result;
    }
}
module.exports = mostrarMetodoDePagoAction; 
