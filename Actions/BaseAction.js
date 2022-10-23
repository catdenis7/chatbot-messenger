
let baseAction = {
    responseObject: {
        "code": Number,
        "data": Object
    },

    codes: {
        "BUTTON": 1,
        "GENERIC": 2,
        "IMAGE": 3,
        "QUICK": 4,
        "TEXT": 5,
    },

    async handleAction(sender, response){},

    response(code, data) {
        return this.responseObject = {
            "code": code,
            "data": data
        }
    }
}


module.exports = baseAction;


