var chatbot = require("./Controller/ChatbotController");
const mongoose = require('mongoose');
var dialogflowApi = require("./Controller/DialogflowController");
require('dotenv').config();
let cors = require('cors');
let session = require('express-session');
// Importar las dependencias para configurar el servidor
var express = require("express");
var bodyParser = require("body-parser");

// Tablas MongoDB
const Album = require("./Models/Album");
const Product = require("./Models/Product");
const Presentation = require("./Models/Presentation");
const Price = require("./Models/Price");
const Offer = require("./Models/Offer");


let clientController = require("./Controller/ClientController");
let contactController = require("./Controller/ContactController");
const orderController = require("./Controller/OrderController");
const ContactMethod = require("./Models/ContactMethod");
const notificationController = require("./Controller/NotificationController");
const Notification = require("./Models/Notification");
const loginController = require("./Controller/LoginController");

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({}))

app.use(session({
    secret: 'esunsecreto',
    resave: true,
    saveUninitialized: false 
}
));

mongoose.connect(
    String(process.env.MONGODB_URL),
    (err, res) => {
        if (err) return console.log("Hubo un error en la base de datos ", err);
        console.log("BASE DE DATOS ONLINE");
    }
);

// configurar el puerto y el mensaje en caso de exito
app.listen((process.env.PORT || 5000), () => console.log('El servidor webhook esta escuchando!'));

// Ruta de la pagina index
app.get("/", (req, res) => chatbot.index(req, res));

// Facebook Webhook

// Usados para la verificacion
app.get("/webhook", (req, res) => chatbot.verification(req, res));

// Todos eventos de mesenger seran capturados por esta ruta
app.post("/webhook", (req, res) => chatbot.responseHandler(req, res));

app.post("/dialogflow/send", async (req, res) => dialogflowApi.sendText(req, res));

//  Servicios para pagina web

app.get("/clients/cards", async (req, res) => clientController.getCards(req, res));

app.post("/clients/orders", async (req, res) => orderController.getOrders(req, res));

app.post("/clients/contacts", async (req, res) => await contactController.getContacts(req, res));

app.post("/clients/notifications", async (req, res) => await notificationController.getNotifications(req, res));

app.get('/dashboard/notification', async (req, res) => await clientController.notification(req, res));

app.post('/contacts/save', async (req, res) => await contactController.addContact(req, res));

app.get('/contacts/methods', async (req, res) => await contactController.getContactMethods(req, res));

//  Login
app.post('/login', async (req, res) => await loginController.login(req, res));
app.post('/register', async (req, res) => await loginController.register(req, res));

app.get('/whoami', (req, res) => {

    res.send(req.session);
})

// Modelos de MongoDB
app.post("/album", (req, res) => {
    let body = req.body;
    let album = new Album({
        name: body.name,
        artist: body.artist,
        date: body.date,
    });
    album.save((err, albumDB) => {
        if (err) return res.json({ ok: false, msg: "Error" });
        res.json({
            ok: true,
            msg: "Album creado correctamente",
            album: albumDB,
        });
    });
});

app.post("/product", (req, res) => {
    let body = req.body;
    let product = new Product({
        image: body.image,
        description: body.description,
        price: body.price,
        album: body.album,
        presentation: body.presentation,
    });
    product.save((err, productDB) => {
        if (err) return res.json({ ok: false, msg: "Error" });
        res.json({
            ok: true,
            msg: "Producto creado correctamente",
            product: productDB,
        });
    });
});

app.post("/presentation", (req, res) => {
    let body = req.body;
    let presentation = new ContactMethod({
        description: body.type,
    });
    presentation.save((err, presentationDB) => {
        if (err) return res.json({ ok: false, msg: "Error" });
        res.json({
            ok: true,
            msg: "Presentacion creado correctamente",
            presentation: presentationDB,
        });
    });
});

app.post("/price", (req, res) => {
    let body = req.body;
    let price = new Price({
        basePrice: body.basePrice,
        salesPrice: body.salesPrice,
        description: body.description,
        fromDate: body.fromDate,
        toDate: body.toDate,
        product: body.product,
        offer: body.offer,
    });
    price.save((err, priceDB) => {
        if (err) return res.json({ ok: false, msg: "Error" });
        res.json({
            ok: true,
            msg: "Price creado correctamente",
            price: priceDB,
        });
    });
});

app.post("/offer", (req, res) => {
    let body = req.body;
    let offer = new Offer({
        discount: body.discount,
        date: body.date,
        status: body.status,
        price: body.price,
    });
    offer.save((err, offerDB) => {
        if (err) return res.json({ ok: false, msg: "Error" });
        res.json({
            ok: true,
            msg: "Offer creado correctamente",
            price: offerDB,
        });
    });
});

app.post("/notification", (req, res) => {
    let body = req.body;
    let notification = new Notification({
        date: body.date,
        message: body.message,
        client: body.client,
    });
    notification.save((err, offerDB) => {
        if (err) return res.json({ ok: false, msg: "Error" });
        res.json({
            ok: true,
            msg: "Noti creado correctamente",
            price: offerDB,
        });
    });

})
