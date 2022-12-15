
const baseAction = require('./BaseAction');
const orderDetailRepository = require('../Repository/OrderDetailRepository');
const sessionRepository = require('../Repository/SessionRepository');
const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');
const orderRepository = require('../Repository/OrderRepository');
const productRepository = require('../Repository/ProductRepository');
const priceRepository = require('../Repository/PriceRepository');
const Album = require('../Models/Album');
const Presentation = require('../Models/Presentation');
const OrderDetail = require('../Models/OrderDetail');

let adicionarAlCarritoAction = {
    async handleAction(sender, response) {
        try {
            if (response.allRequiredParamsPresent) {
                let albumModel = Album;
                let presentationModel = Presentation;
                let orderDetailModel = OrderDetail;
                let quantity = response["parameters"]["fields"]["number"]["numberValue"];
                
                let getProspect = await prospectRepository.find({ facebookID: sender });              
                let getClient = await clientRepository.find({ prospect: getProspect._id });
                
                
                let matchOrder = await orderRepository.find({ client: getClient._id, type: "C"});
                let getOrderDetail = await orderDetailModel.findOne({order: matchOrder._id, quantity: null}).sort({ _id: -1 }).limit(1);
                
                

                let getProductInfo = await productRepository.find({ _id: getOrderDetail.product });
                let getPrice = await priceRepository.find({ _id: getProductInfo.price });
                let productPrice = getPrice.salesPrice;
                let detailTotal = quantity * productPrice;

                if (quantity != null && productPrice != null && detailTotal != null) {

                    await orderDetailRepository.upsert({ _id: getOrderDetail._id }, {
                        quantity: quantity,
                        productPrice: productPrice,
                        detailTotal: detailTotal,
                    });
                    let getAlbumInfo = await albumModel.findOne({ _id: getProductInfo.album });
                    let getPresentationInfo = await presentationModel.findOne({ _id: getProductInfo.presentation });
                    return baseAction.response(baseAction.codes.TEXT, "Se ha(n) añadido " + quantity + " producto(s) de " + getAlbumInfo.name + " - " + getAlbumInfo.artist + " formato " + getPresentationInfo.type + " de forma exitosa. ¿Desea adquirir otro producto más?");

                } else {
                    await orderDetailModel.findOneAndDelete({_id: getOrderDetail._id});       
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
module.exports = adicionarAlCarritoAction; 
