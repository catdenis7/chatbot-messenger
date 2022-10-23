const { response } = require("express");
const dialogflowApi = require("./DialogflowController");
// mongoose 
const mongoose = require('mongoose');

const chatbotService = require('../Service/ChabotService');


let chatbot = {
    index(req, res) {
        res.send("Se ha desplegado de manera exitosa el Vellaryon ChatBot :D!!!");
    },

    verification(req, res) {
        chatbotService.verification(req, res);
    },
    
    responseHandler(req, res) {
        console.log("Request webhook" + JSON.stringify(req.body));
        chatbotService.responseHandler(req, res);
    },

};


module.exports = chatbot;
