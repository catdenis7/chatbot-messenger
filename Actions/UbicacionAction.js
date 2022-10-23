const baseAction = require('./BaseAction');
const Album = require("../Models/Album");
const Product = require("../Models/Product");
const Presentation = require("../Models/Presentation");
const Price = require("../Models/Price");
const Offer = require("../Models/Offer");

let ubicacionAction = baseAction;

ubicacionAction.handleAction = async function(sender, response) {
    //TODO: Definir logica
}

module.exports = ubicacionAction; 
