let mongodbApi = {
    async store(req, res) {
        await sendData(req.body);
        console.log('hello');
        res.send('hello');
    }
}

async function sendData(req) {
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const uri = "mongodb+srv://corlysvelaryon:test@mondongo-bot.zakwctm.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    console.log('test');
    let result = client.connect(async err => {
        const collection = client.db("velaryon").collection("clients");
        let result = await collection.insertOne(req);
        console.log(result);
        client.close();
    });
    console.log(result);
}

module.exports = mongodbApi;
