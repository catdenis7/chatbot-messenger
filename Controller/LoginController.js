const loginService = require("../Service/LoginService");

let loginController = {

    async login(req, res) { await loginService.login(req, res);},
    async register(req, res) { await loginService.register(req, res);}
}

module.exports = loginController;
