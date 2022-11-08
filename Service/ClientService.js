let clientRepository = require('../Repository/ClientRepository');
let prospectRepository = require('../Repository/ProspectRepository');
const sessionRepository = require('../Repository/SessionRepository');
const orderDetailRepository = require('../Repository/OrderDetailRepository');
const orderRepository = require('../Repository/OrderRepository');
const contactRepository = require('../Repository/ContactRepository');
let clientService = {

    async find(query, many = false) {
        return await clientRepository.find(query, many = many);
    },

    async insert(prospectQuery, query) {
        let prospect = await prospectRepository.find(prospectQuery);
        query['prospect'] = prospect;
        return await clientRepository.insert(query);
    },

    async upsert(query, newData) {
        return await clientRepository.upsert(query, newData);
    },

    async getCards(req, res) {
        try {

            let result = {};
            // console.log('Getting Cards');

            let prospectContacts = this.toJson(await clientRepository.find({}, true));
            let prospectId = [];
            for (let index = 0; index < prospectContacts.length; index++) {
                const element = prospectContacts[index];
                prospectId.push((element.prospect));
            }
            // console.log(prospectContacts);
            let prospects = this.toJson(await prospectRepository.find({ _id: { $nin: prospectId } }, true));
            // console.log(prospects)

            for (let index = 0; index < prospects.length; index++) {
                let prospect = prospects[index];
                let sessionResult = await sessionRepository.find({ prospect: (prospect._id) }, true, { "createdAt": -1 });
                prospect.session_count = sessionResult.length;
                if (sessionResult.length > 0)
                    prospect.last_session = sessionResult[0].createdAt;
            }

            let prospectClients = this.toJson(await prospectRepository.find({ _id: { $in: prospectId } }, true));

            let contacts = this.toJson(await clientRepository.find({ "prospect": { $in: prospectClients }, "type": "C" }, true));  //C de Customer

            for (let index = 0; index < contacts.length; index++) {
                let contact = contacts[index];
                let contactResult = await contactRepository.find({ client: (contact._id) }, true, { "createdAt": -1 });
                let prospect = await prospectRepository.find({ _id: contact.prospect });
                contact.profilePicture = prospect.profilePicture;
                contact.url = prospect.url;
                contact.contact_count = contactResult.length;
                if (contactResult.length > 0)
                    contact.last_contact = contactResult[0].createdAt;
            }

            let clients = this.toJson(await clientRepository.find({ "prospect": { $in: prospectClients }, "type": "P" }, true));   //P de Paying Customer

            for (let index = 0; index < clients.length; index++) {
                let client = clients[index];
                let clientResult = await orderRepository.find({ client: (client._id) });
                console.log("SOY CLIENT RESULT ====>" + clientResult);
                let prospect = await prospectRepository.find({ _id: client.prospect });
                client.profilePicture = prospect.profilePicture;
                client.url = prospect.url;
                if (clientResult != null) {
                    let clientDetailResult = await orderDetailRepository.find({ order: clientResult }, true);
                    client.product_count = clientDetailResult.length;
                    client.order_date = clientResult.createdAt;
                }
            }

            let recurringClients = this.toJson(await clientRepository.find({ "prospect": { $in: prospectClients }, "type": "R" }, true));  //R de Recurring Customer

            for (let index = 0; index < recurringClients.length; index++) {
                let recurringClient = recurringClients[index];
                let recurringClientResult = await orderRepository.find({ client: (recurringClient._id) }, true, { createdAt: -1 });
                console.log("FRECUENT CLIENT RESULT =====>" + recurringClientResult);
                let prospect = await prospectRepository.find({ _id: recurringClient.prospect });
                recurringClient.profilePicture = prospect.profilePicture;
                recurringClient.url = prospect.url;
                if (recurringClient != null) {
                    let process = this.getFrequencyAndAverage(recurringClientResult);
                    recurringClient.frequency = process.frequency;
                    recurringClient.average = process.average;
                    recurringClient.order_date = recurringClientResult[0].createdAt;
                }
            }

            return {
                "prospects": prospects,
                "contacts": contacts,
                "clients": clients,
                "recurringClients": recurringClients
            }
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.send(error);
        }
    },

    async notification(req, res) {
        let connected = true;

        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        });
        res.flushHeaders();

        res.on('close', () => {
            connected = false;
            res.end();
        })


        while (connected) {
            await new Promise(resolve => setTimeout(resolve, 800));
            res.write('event: message\n');  // message event
            res.write('data: ' + JSON.stringify(await this.getCards()));
            res.write("\n\n");
        }
        console.log('Conexion cerrada');
    },

    toJson(document) {
        return JSON.parse(JSON.stringify(document));
    },

    getFrequencyAndAverage(clientDetailResult) {
        let frequency = 0;
        let average = 0;
        let index = 0;
        let finalDate;
        let startDate;
        for (index = 0; index < clientDetailResult.length; index++) {
            const clientDetail = clientDetailResult[index];
            average += clientDetail.total;
            if (index == 0){
                startDate = clientDetail.date;
            } else {
                finalDate = clientDetail.date;
                frequency = frequency + ((this.convertDate(startDate) - this.convertDate(finalDate))/(1000*60*60*24));
                console.log("start ===>" + startDate);
                console.log("FINAL ===>" +finalDate);
                console.log("FFFFFFFF ======>"+ frequency);
                startDate = finalDate;
            }
        }

        average = Math.round((average/index) * 100) / 100;
        frequency = Math.round((frequency/ (index -1)) * 100) / 100;
        
        return {
            frequency: frequency,
            average: average,
        }

    },

    convertDate(thedate) {
        var time = thedate.getTime();
        return time - (time % 86400000);
    },

    async getContacts(req, res) {
        console.log("Getting Contacts");
        let clientId = req.body.clientId;
        let contacts = await contactRepository.find(
            { client: clientId },
            true,
            null,
            ['client', 'contactMethod'],
        );
        console.log(contacts);
        return contacts;
    },

    async getPersonalData(req, res) {
        try {
            let clientId = req.body.clientId; 
            let clientData = await clientRepository.find({_id: clientId});
            let prospectData = await prospectRepository.find({_id: clientData.prospect});
            let data = [{
                'name': clientData.name,
                'lastName': clientData.lastName,
                'phoneNumber': clientData.phoneNumber,
                'email': clientData.email,
                'profilePicture': prospectData.profilePicture,
                'url': prospectData.url,
            }]
            return data;

            //TODO: completar servicio
        } catch (error) {
            res.statusCode = 500;
            return(error);
        }
    }

}

module.exports = clientService;
