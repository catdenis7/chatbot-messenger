const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
let dialogflowApi = {

    async sendText(req, res) {
        let inputText = req.body.text;
        let response = await runSample(inputText);
        let responseJson = {
            "data" : response
        }
        res.send(responseJson);
    },
    async processText(input){
        return await runSample(input);
    }
}

async function runSample(inputText, senderID) {
    const rawKey = require('../apikey.json');
    let apikey = JSON.parse(JSON.stringify(rawKey));
    const sessionId = senderID;
    console.log(sessionId);
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
        sessionId
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
    if (result.intent) {
        return result.fulfillmentText;
    } else {
        return null;
    }
}

module.exports = dialogflowApi;
