const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const axios = require('axios');

let dialogflowApi = {

    async sendText(req, res) {
        let inputText = req.body.text;
        let response = await runSample(inputText);
        let responseJson = {
            "data": response
        }
        res.send(responseJson);
    },
    async processText(input) {
        return await runSample(input);
    }
}

async function runSample(inputText, senderID) {
    const rawKey = require('../apikey.json');
    let apikey = JSON.parse(JSON.stringify(rawKey));
    let sessionId = await getUuidFromDb(senderID);
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

function idToUuid(sessionId) {
    let byteArray = [];
    for (let i = 0; i < 16; i++) {
        let sessionIDStr = String(sessionId);
        byteArray[i] = Number(sessionIDStr.charAt(i));
    }
    return uuid.v4(byteArray);
}

async function getUuidFromDb(facebookId) {
    let getUrl = String(process.env.APIURL) + '/get/' + facebookId;
    let postUrl = String(process.env.APIURL) + '/save';
    await axios.get(getUrl).then(
        async (response) => {
            if (response.data.length == 0) {
                let newUuid = idToUuid(facebookId);
                await axios({
                    method: 'POST',
                    url: postUrl,
                    data: {
                        'facebook_id': facebookId,
                        'session_id': newUuid
                    }
                }).catch((e) => { console.log(e) });
                return newUuid;
            }
            else return response.data[0].session_id;
        }
    ).catch((e) => { console.log(e) });
}

module.exports = dialogflowApi;
