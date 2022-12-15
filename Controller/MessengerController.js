const dialogflowApi = require("./DialogflowController");

//mongodb models

const prospectService = require('../Service/ProspectService')

const Album = require("../Models/Album");
const sessionIDs = new Map();
const messengerService = require('../Service/MessengerService');
const { postToFeed }=require("../Repository/MessengerRepository.js");
const { default: messengerRespository }=require("../Repository/MessengerRepository.js");

let messenger = {
    async saveUserData(facebookID) {
        let userData = await getUserData(facebookID);
        console.log(JSON.stringify(userData));

        if (userData.first_name == null)
            return;

        let result = await prospectService.upsert({
            "facebookID": facebookID
        }, {
            "facebookName": userData.first_name + " " + userData.last_name,
            "profilePicture": userData.profile_pic,
        }, );
        console.log("Se creo el usuario", result);
        console.log("SOY MESSENGER CONTROLLER");
    },

    async sendToDialogFlow(senderID, messageText) {
        try {
            let result;
            await messengerService.setSessionAndUser(senderID);
            let session = sessionIDs.get(senderID);
            result = await dialogflowApi.processText(messageText, session, "FACEBOOK");
            messengerService.handleDialogFlowResponse(senderID, result);
        } catch (error) {
            console.log("Salio mal en sendToDialogFlow", error);
        }
    },

    async postToFeed(req, res){
        try {
           res.send(await messengerService.postToFeed(req.body.photo, req.body.message)); 
        } catch (error) {
            res.statusCode = 500;
            console.log(error)
            res.send(error);
        }
    }

}


module.exports = messenger;
