const dialogflow = require('@google-cloud/dialogflow');
var request = require("request");
const { response } = require("express");
const dialogflowApi = require("./dialogflow");
const { json } = require("body-parser");
//mongodb models
const Prospect = require('../Models/Prospect');


async function saveUserData(facebookID) {
    let userData = await getUserData(facebookID);
    let prospect = new Prospect({
        facebookID,
        facebookName: userData.firstName + userData.lastName,
        profilePicture: userData.profilePicture,
    });
    prospect.save((err, res) => {
        if (err) return console.log(err);
        console.log("Se creo un usuario:", res);
    });
}

module.exports = {
    "saveUserData": saveUserData
}

async function getUserData(senderId) {
    console.log("consiguiendo datos del usuario...");
    let access_token = process.env.PAGE_ACCESS_TOKEN;
    try {
      let userData = await axios.get(
        "https://graph.facebook.com/v6.0/" + senderId,
        {
          params: {
            access_token,
          },
        }
      );
      return userData.data;
    } catch (err) {
      console.log("algo salio mal en axios getUserData: ", err);
      return {
        firstName: "",
        lastName: "",
        profilePicture: "",
      };
    }
  }