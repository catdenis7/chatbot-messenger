const dialogFlowRepository = require('../Repository/DialogflowRepository');

let dialogflowService = {

    async processText(input, senderID, source) {
        return await dialogFlowRepository.runSample(input, senderID, source);
    },
    async getUuid(facebookID) {
        return await dialogFlowRepository.getUuidFromDb(facebookID);
    }

}

module.exports = dialogflowService;