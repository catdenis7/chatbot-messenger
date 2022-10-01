let dialogflowController = {

    async sendText(req, res) {
        let inputText = req.body.text;
        let response = await runSample(inputText);
        let responseJson = {
            "data": response
        }
        res.send(responseJson);
    },
}


module.exports = dialogflowController;