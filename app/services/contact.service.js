const {ObjectID} = require("mongodb");
class ContactService {
    constructor(client){
        this.Contact = client.db().collection("contacts");
        const contact ={
            name: payload.name,
            email: payload.email,
            address: payload.adress,
            phone: payload.phone,
            favorite: payload.favorite,
        };
        Object.keys(contact).forEach(
            (key) => contact[key] === undefined && delete contact[key]
        );
        return contact;
    }

    async find(filter){
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async findByName(name){
        return await this.find({
            name: {$regex: new RegExp(new RegExp(name)), $options: "i"},
        });
    }

    async create(payload){
        const contact = this.extractConactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            contact,
            {$set: {favorite: contact.favorite === true}},
            {returnDocument: "after", upsert:true}
        );
        return result;
    }

    async update(id,payload){
        const filter = {
            _id:ObjectId.isValid(id)? new ObjectID(id):null,
        };
        const update = this.extractConactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            {$set: update},
            {returnDocument: "after"}
        );
        return result.value;
        
    }
}

module.exports = ContactService;