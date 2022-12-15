
const baseAction = require('./BaseAction');
const orderDetailRepository = require('../Repository/OrderDetailRepository');
const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');
const orderRepository = require('../Repository/OrderRepository');
const productRepository = require('../Repository/ProductRepository');
const Album = require('../Models/Album');
const Presentation = require('../Models/Presentation');

let detalleCarritoAction = {
    async handleAction(sender, response) {
        try {
            let albumModel = Album;
            let presentationModel = Presentation;
            let getProspect = await prospectRepository.find({ facebookID: sender });
            //console.log("SOY GET PROSPECT ===>" + getProspect);
            let getClient = await clientRepository.find({ prospect: getProspect._id });
            //console.log("SOY GET CLIENT ===>" + getClient);
            let matchOrder = await orderRepository.find({ client: getClient._id, type: "C" });
            //console.log("soy match order ====>" + matchOrder);

            let getOrderDetail = await orderDetailRepository.find({ order: matchOrder._id }, true);
            console.log("SOY LAS ORDERNES ====>" + getOrderDetail);
            let total = 0;
            let detalleCarritoText = "";
            for (var i = 0; i < getOrderDetail.length; i++) {
                let orderDetailItem = getOrderDetail[i];
                let getProductInfo = await productRepository.find({ _id: orderDetailItem.product });
                let getAlbumInfo = await albumModel.findOne({ _id: getProductInfo.album });
                let getPresentationInfo = await presentationModel.findOne({ _id: getProductInfo.presentation });
                total = total + orderDetailItem.detailTotal;
                detalleCarritoText = detalleCarritoText + "\n" +
                    getAlbumInfo.name + " - " + getAlbumInfo.artist + " ( " + getPresentationInfo.type + " ) \n" +
                    "Cantidad: " + orderDetailItem.quantity + "   Precio Unitario: Bs. " + orderDetailItem.productPrice + "   Total: Bs. " + orderDetailItem.detailTotal + "\n" +
                    "----------------------------------------------";
            }
            detalleCarritoText = detalleCarritoText + " \n PRECIO SUBTOTAL:   " + total;
            let postbackInfo = {
                "order_id": matchOrder._id,
                "session_id": sender,
                "total": total,
                "postback": "DEVELOPER_DEFINED_CONFIRMACION"
            }
            let resultButton = {
                text: detalleCarritoText,
                buttons: [
                    {
                        type: "postback",
                        title: "CONFIRMAR PEDIDO",
                        payload: JSON.stringify(postbackInfo),
                    },
                ]
            };
            let result = {
                'text': 'Estos son los productos que se encuentran en su carrito. Si todo esta en orden, confirme su pedido.',
                'buttons': resultButton,
            }
            return result;
        } catch (error) {
            console.error(error);
        }
    }
}
module.exports = detalleCarritoAction; 
