let chatbotRepository = require("../Repository/ChatbotRepository");

let chatbotService = {
    verification(req, res) {
        // Verificar la coincidendia del token
        if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
            // Mensaje de exito y envio del token requerido
            console.log("webhook verificado!");
            res.status(200).send(req.query["hub.challenge"]);
        } else {
            // Mensaje de fallo
            console.error(
                "La verificacion ha fallado, porque los tokens no coinciden"
            );
            res.sendStatus(403);
        }
    },

    responseHandler(req, res) {
        // Verificar si el evento proviene del pagina asociada
        if (req.body.object == "page") {
            // Si existe multiples entradas entradas
            req.body.entry.forEach(function(entry) {
                // Iterara todos lo eventos capturados
                entry.messaging.forEach(async function(event) {
                    if (event.message) {
                        await chatbotRepository.processEvent(event);
                    }
                });
            });
            res.sendStatus(200);
        }
    },
}

module.exports = chatbotService;