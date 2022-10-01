const { response } = require("express");
const dialogflowApi = require("./DialogflowController");
// mongoose 
const mongoose = require('mongoose');

const chatbotService = require('../Service/ChabotService');

mongoose.connect(
    'mongodb+srv://corlysvelaryon:test@mondongo-bot.zakwctm.mongodb.net/velaryon?retryWrites=true&w=majority',
    (err, res) => {
        if (err) return console.log("Hubo un error en la base de datos ", err);
        console.log("BASE DE DATOS ONLINE");
    }
);

let chatbot = {
    index(req, res) {
        res.send("Se ha desplegado de manera exitosa el Vellaryon ChatBot :D!!!");
    },

    verification(req, res) {
        chatbotService.verification(req, res);
    },

    responseHandler(req, res) {
        chatbotService.responseHandler(req, res);
    },

};


module.exports = chatbot;