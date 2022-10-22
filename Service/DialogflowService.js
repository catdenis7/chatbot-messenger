const dialogFlowRepository = require('../Repository/DialogflowRepository');

let dialogflowService = {

    async processText(input, senderID, source) {
        return await dialogFlowRepository.runSample(input, senderID, source);
    },
}

module.exports = dialogflowService;
