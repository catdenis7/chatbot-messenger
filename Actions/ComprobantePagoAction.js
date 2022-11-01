const baseAction = require('./BaseAction');
const prospectRepository = require('../Repository/ProspectRepository');
const clientRepository = require('../Repository/ClientRepository');
const orderRepository = require('../Repository/OrderRepository');

let comprobantePagoAction = {async handleAction(sender, response) {
     
        let getProspect = await prospectRepository.find({facebookID: sender});
        //console.log("SOY GET PROSPECT ===>" + getProspect);
        let getClient = await clientRepository.find({prospect: getProspect._id});
        let matchOrder = await orderRepository.find({client: getClient._id, type: "O", status: "ABIERTO"});
        if (matchOrder != null){
            await orderRepository.upsert({_id: matchOrder._id},{
                status: "CERRADO",
            });
            let typeClient = await orderRepository.find({client: getClient._id, type: "O", status: "CERRADO"},true);
             if (typeClient.length == 1){
                await clientRepository.upsert({ _id : matchOrder.client}, {
                    type: "P",            
                });
            } else if (typeClient.length > 1){
                await clientRepository.upsert({ _id : matchOrder.client}, {
                    type: "R",            
                });
            }
        }
        return baseAction.response(baseAction.codes.TEXT, response.fulfillmentText);
    
}
}

module.exports = comprobantePagoAction; 
