const dialogflowService = require("../Service/DialogflowService");

const prospectService = require('../Service/ProspectService')

let messengerRespository = require('../Repository/MessengerRepository');

let messengerService = {
    async saveUserData(facebookID) {
        let userData = await messengerRespository.getUserData(facebookID);
        console.log(JSON.stringify(userData));

        if (userData.first_name == null)
            return;

        let result = await prospectService.upsert({
            "facebookID": facebookID
        }, {
            "facebookName": userData.first_name + " " + userData.last_name,
            "profilePicture": userData.profile_pic,
        }, );
        console.log("Se creo el usuerio", result);
    },

    async sendToDialogFlow(senderID, messageText) {
        try {
            let result;
            messengerRespository.setSessionAndUser(senderID);
            console.log("SOY EL VERDADERO SENDERID =====>"+ senderID);
            let session = messengerRespository.getSessionIDs(senderID);
            result = await dialogflowService.processText(messageText, session, "FACEBOOK");
            messengerRespository.handleDialogFlowResponse(senderID, result);
        } catch (error) {
            console.log("Salio mal en sendToDialogFlow", error);

        }
    }

}

module.exports = messengerService;