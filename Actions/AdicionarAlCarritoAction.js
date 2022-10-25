
const baseAction = require('./BaseAction');
const orderDetailRepository = require('../Repository/OrderDetailRepository');
const sessionRepository = require('../Repository/SessionRepository');
const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');
const orderRepository = require('../Repository/OrderRepository');
const Product = require('../Models/Product');
const Price = require('../Models/Price');
const Album = require('../Models/Album');
const Presentation = require('../Models/Presentation');

let adicionarAlCarritoAction = {async handleAction(sender, response) {
    let albumModel = Album;
    let presentationModel = Presentation;
    let quantity = response["parameters"]["fields"]["number"]["numberValue"];
    //let getSession = await sessionRepository.find({sessionID: sender});
    //console.log("SOY GETSESSION ===>" + getSession);
    let getProspect = await prospectRepository.find({facebookID: sender});
    console.log("SOY GET PROSPECT ===>" + getProspect);
    let getClient = await clientRepository.find({prospect: getProspect._id});
    console.log("SOY GET CLIENT ===>" + getClient);
    let matchOrder = await orderRepository.find({client: getClient._id, type: "C"});
    console.log("soy match order ====>" + matchOrder);

    let getOrderDetail = await orderDetailRepository.find({order: matchOrder._id, quantity: null});
    console.log("soy get order detail ====>" + matchOrder);
    /*
    ----------------------------PARA OBTENER EL PRECIO CUANDO ESTE CORREGIDO------------------------------
    let getProduct = await productModel.findOne({_id: getOrderDetail.product});
    let getPrice = await priceModel.findOne({_id: getProduct.price});
    */
    let productPrice = /*getPrice.salesPrice*/ 500;
    let detailTotal = quantity * productPrice;
    let orderDetailUpdate = await orderDetailRepository.upsert({ _id : getOrderDetail._id}, {
        quantity: quantity,
        productPrice:productPrice,
        detailTotal: detailTotal,             
    });
    let getProductInfo = await productModel.findOne({_id: getOrderDetail.product});
    let getAlbumInfo = await albumModel.findOne({_id: getProductInfo.album});
    let getPresentationInfo = await presentationModel.findOne({_id: getProductInfo.presentation});
    return baseAction.response(baseAction.codes.TEXT, "Se ha(n) añadido "+ quantity+ " producto(s) de "+ getAlbumInfo.name+ " - "+ getAlbumInfo.artist + " formato "+ getPresentationInfo.type + " de forma exitosa. ¿Desea adquirir otro producto más?");
}
}
module.exports = adicionarAlCarritoAction; 
