const ApiError = require("../api-error");
const ContactService = require("../services/contact.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res,next) => {
    if(!req.body?.name){
        return next(new ApiError(400, "Name cannot be empty"));
    }
    try{
        const ContactService = new ContactService(MongoDB.client);
        const document = await ContactService.create(req.body);
        return res.send(document);
    }catch(error){
        return next(
            new ApiError(500, "An error occured while creating contact")
        );
    }
};

exports.findAll = async(req, res, next) => {
    let document = [];
    try{
        const contactService = new ContactService (MongoDB.client);
        const {name} = req.query;
        if(name){
            document = await contactService.findByName(name);
        }else{
            document = await contactService.find({});
        }
    }catch(error){
        return next(
            new ApiError (500, "An error occured while retriveing contacts")
        );
    }
    return res.send(document);
};

exports.findOne = (req, res) => {
    res.send({message: "findONe handler"});
};

exports.update = async(req, res,next) => {
    if(Object.keys(req.body).length === 0 ){
        return next(new ApiError(400,"Data to update cannot be empty"));
    }
    try{
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.update(req.params.id, req.body);
        if(!document){
            return next (new ApiError(404, "Contact not found"));
        }
        return res.send({Message: "Contact was updated succesfully"});
    }catch(error){
        return next(
            new ApiError(500, `Error updating contact with id=$req.params.id}`)
        )
    }
    
};

exports.delete = (req, res) => {
    res.send({message: "delete handler"});
}; 

exports.deleteAll = (req, res) => {
    res.send({message: "deleteAll handler"});
};

exports.findAllFavorite = (req, res) => {
    res.send({message: "findAllFavorite handler"});
};
