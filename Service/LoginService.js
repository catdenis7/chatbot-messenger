let bcrypt = require('bcrypt');

let personRepository = require('../Repository/PersonRepository');
let userRepository = require('../Repository/UserRepository');

let loginService = {

    async login(req, res) {
        try {
            let user = await userRepository.find({ userName: req.body.userName })

            if (user == null)
                throw "Usuario no existe"

            let passwordValid =  bcrypt.compareSync(req.body.password, user.password);

            if (!passwordValid)
                throw "Contraseña incorrecta"
            req.session.userName = user.userName;
            req.session.userId = user._id;
            res.send("Loggeado!");
        } catch (error) {
            res.statusCode = 500;
            console.log(error);
            res.send(error);
        }
    },

    async register(req, res) {

        try {

            let personalData = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                gender: req.body.gender,
                birthday: req.body.birthday,
            }

            let person = await personRepository.insert(personalData);

            let salt = bcrypt.genSaltSync(10);
            let userData = {
                userName: req.body.userName,
                password: bcrypt.hashSync(req.body.password,salt),
                picture: req.body.picture,
                person: person
            }

            let result = await userRepository.insert(userData);
            res.send(result);
        } catch (error) {
            res.statusCode = 500;
            res.send(error);
        }
    }
}

module.exports = loginService;
