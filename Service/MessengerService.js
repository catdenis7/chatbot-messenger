const dialogflowService = require("../Service/DialogflowService");

const prospectService = require('../Service/ProspectService')

let messengerRespository = require('../Repository/MessengerRepository');
const sessionService = require("./SessionService.js");
const { default: sessionRepository }=require("../Repository/SessionRepository.js");

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
        });

        let sessionId = messengerRespository.getSessionIDs(facebookID);
        console.log("SOY UN SESSION ID DE MESSENGER SERVICE =====>" + sessionId);
        let isNewSession = await sessionService.find({ sessionID: sessionId }) == null;

        if (isNewSession) {    
            let newSessionResult = await sessionService.insert(
                { 
                    sessionID: sessionId,
                    startDate : Date.now(),
                    prospect :  result
                }
            );
            console.log("Se creo una nueva sesion", newSessionResult);
        }
        console.log("result ===>" + result);

        // let sessionResult= sessionService.upsert({ sessionID : sessionId }, );
        console.log("Se creo el usuario", result);
        console.log("SOY MESSENGER SERVICE");
    },

    async sendToDialogFlow(senderID, messageText) {
        try {
            let result;
            messengerRespository.setSessionAndUser(senderID);
            console.log("SOY EL VERDADERO SENDERID =====>" + senderID);
            let session = messengerRespository.getSessionIDs(senderID);
            result = await dialogflowService.processText(messageText, session, "FACEBOOK");
            messengerRespository.handleDialogFlowResponse(senderID, result);
            let getProspect = await prospectService.find({facebookID: senderID});
            let sessionUpdate = await sessionService.upsert({ sessionID : session}, {
                endDate : Date.now(),
                payload : JSON.stringify(result),
                prospect : getProspect._id,               
            });

        } catch (error) {
            console.log("Salio mal en sendToDialogFlow", error);

        }
    },

    async setSessionAndUser(senderId){
        await messengerRespository.setSessionAndUser(senderId);
    },
    
    handleDialogFlowResponse(sender, response){
        messengerRespository.handleDialogFlowResponse(sender, response);
    }
}

module.exports = messengerService;
