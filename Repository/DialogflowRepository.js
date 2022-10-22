const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const axios = require('axios');


let dialogFlowRepository = {

    async runSample(inputText, senderID, source) {
        const rawKey = require('../apikey.json');
        let apikey = JSON.parse(JSON.stringify(rawKey));
        //console.log(sessionId);
        //  Creando Sesion nueva
        const sessionClient = new dialogflow.SessionsClient({
            projectId: apikey.project_id,
            credentials: {
                client_email: apikey.client_email,
                private_key: apikey.private_key
            }
        });

        const sessionPath = sessionClient.projectAgentSessionPath(
            apikey.project_id,
            senderID
        );

        // Petición para mandar a la API.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    //Texto a mandar
                    text: inputText,
                    languageCode: 'es-ES',
                },
            },
        };

        // Manda peticion
        console.log('\n\n\nSending data.....\n\n\n')
        const responses = await sessionClient.detectIntent(request);
        console.log('Detected intent');
        const result = responses[0].queryResult;

        console.log("INTENT EMPAREJADO: ", result.intent.displayName);
        let defaultResponses = [];
        if (result.action !== "input.unknown") {
            result.fulfillmentMessages.forEach((element) => {
                if (element.platform == source) {
                    defaultResponses.push(element);
                }
            });
        }
        if (defaultResponses.length == 0) {
            result.fulfillmentMessages.forEach((element) => {
                if (element.plaform == "PLATFORM_UNSPECIFIED") {
                    defaultResponses.push(element);
                }
            });
        }
        result.fulfillmentMessages = defaultResponses;
        return result;


        if (result.intent) {
            return result.fulfillmentText;
        } else {
            return null;
        }
    },

    idToUuid(sessionId) {
        let byteArray = [];
        for (let i = 0; i < 16; i++) {
            let sessionIDStr = String(sessionId);
            byteArray[i] = Number(sessionIDStr.charAt(i));
        }
        return uuid.v4(byteArray);
    },

}


module.exports = dialogFlowRepository;
