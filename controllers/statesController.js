
const data = {}; 
data.states = require('../model/states.json'); 
const { nextDay } = require('date-fns');
const connectDB = require('../config/dbConn');
const { findOneAndUpdate } = require('../model/funfact');
const funfact = require('../model/funfact');
//const bcrypt = require ('bcrypt'); 

//input: req and res  
//returns: info from the states.JSON file of a single state passed in on the req parameter
function singleState (req, res) {
        const state = data.states.find(cd => cd.code === (req.params.state)); 
        if (!state) {
            console.log(req.params.state); 
            return res.status(400).json({ "message": `Invalid state abbreviation parameter` });
        }
        return(state); 
}

async function mergeObjects (ArrayOfObjects) {
        
    for (let i = 0; i < ArrayOfObjects.length; i++ ) {
            //for each element of the foreach loop, look up a funfact
        const funFactObject = await funfact.findOne({code: ArrayOfObjects[i].code}).exec(); 


        //if there is a funfact in the db, then element.funfact is set
            if (funFactObject!== null) {
            
                ArrayOfObjects[i].funfacts ={...funFactObject.funfact}; 
                //newArray.push(element);
                //console.log(element); 
            }

        //If there isn't one, the element's funfact should be set to null. 
            else{
                ArrayOfObjects[i].funfacts = []; 
               // newArray.push(element);
                //console.log(element); 
            }
    }

    return ArrayOfObjects; 

}

//input: req res and contig query variable
//output: sends db data based of appropriate contig value. 
function contigHandler (req, res, contig) {
    var statesList = {}; 

    //if the contig query is true, do this: 
    if(contig === "true"){
        console.log("true fired")
        statesList = data.states.filter(st => st.code !== 'AK' || st.code !== 'HI'); 
        console.log(statesList); 
        res.json(statesList); 
       
        
        
    } 

    //if the contig query is false, do this: 
    else if(contig === "false"){
        statesList = data.states.filter(st => st.code === 'AK' || st.code === 'HI'); 
        res.json(statesList); 
    }
}



//this function responds to requests to "/states" including if a contig query is sent. 
const getAllStates  = async (req, res) => {
    var statesList = {}; 

    //identify if contig query has been sent:

    if(req.query?.contig === "true" || req.query?.contig === "false"){
        var contig = req.query.contig; 
        
            //if the contig query is true, do this: 
            if(contig === "true"){
                statesList = data.states.filter(st => st.code !== 'AK' || st.code !== 'HI'); 
            } 

            //if the contig query is false, do this: 
            if(contig === "false"){
                statesList = data.states.filter(st => st.code === 'AK' || st.code === 'HI'); 
            }
            
    }
    
    //if no contig param is sent, then copy all states data into the list
    else {
        statesList = data.states;}
    
    //get a new array that holds the states.data object merged with the funfacts pulled from the db


    await mergeObjects(statesList); 
    
    res.json(statesList);  
}
    
    



//Why is getSingleState calling singleState? They are basically equivalent. 
//It's because I wanted to reuse the singleState() over and over in the other controller functions. I couldn't
//use getSingleState because it sends a response, which means calls to it from other controller functions resulted in
//errors due to duplicate res calls. singleState() doesn't send a response which means I can use it in the other controller functions. 
const getSingleState = (req, res) => {
    const state = singleState(req, res);
    res.json(state); 
}

const stateCapital = (req, res) => {
    //get the requested state
    const state = singleState(req, res); 

    //return the requested state's info (capital/nickname/population/admission): 
    res.json({
        "state": state.state,
        "capital": state.capital_city
}); 

}

const stateNickName = (req, res) => {
    //get the requested state
    const state = singleState(req, res); 

    //return the requested state's info (capital/nickname/population/admission): 
    res.json({
        "state": state.state,
        "nickname": state.nickname
}); 
}

const statePopulation = (req, res) => {
    //get the requested state
    const state = singleState(req, res); 

    //convert state.population to string with commas: 
    var population = state.population.toLocaleString("en-US"); 
    
    //return the requested state's info (capital/nickname/population/admission): 
    res.json({
        "state": state.state,
        "population": population
}); 

}

const stateAdmission = (req, res) => {
    //get the requested state
    const state = singleState(req, res); 

    //return the requested state's info (capital/nickname/population/admission): 
    res.json({
        "state": state.state,
        "admitted": state.admission_date
}); 

}

//post to mongoDB database docs

const createNewFunFact = async (req, res) => {
    //first step is to check req for correct formate. 
    if (!req?.body?.code || !req?.body?.funfact) {
        return res.status(400).json({'message': 'State fun facts value required'});
    }

    //next use updateOne to check for the state code being sent in. If its there, it will update by pushing a new funfact into the funvact array,
    //if not it will create a new entry. Perfect. 
        try {
            const result = await funfact.updateOne({code: req.body.code}, {$push:{funfact: req.body.funfact}}, {upsert:true});  
            res.status(201).json(result); 
        } catch (err) {
            console.error(err); 
        }
    }

const updateFunFact = async (req, res) => {
    
    //first step is to check req for correct format. 
    if (!req?.body?.index || !req?.body?.funfact) {
        return res.status(400).json({'message': 'Index and funfact required'});
    }
   //next assign a local variable the desired funfact from the db
    const funFactUpdate = await funfact.findOne({code: req.params.state}).exec(); 

    //if this doesn't work, return an error
    if (!funFactUpdate) {
        return res.status(204).json({"message": `No funfact at index ${req.body.index} for state ${req.param.state} `})
    }

    try{
    //otherwise assign the local variable object the new funfact, and then save it. 
    const index = req.body.index; 
    funFactUpdate.funfact[index-1] = req.body.funfact; 

    const result = await funFactUpdate.save(); 
    res.json(result); 
    } catch (err) {
        console.error(err); 
}

}

const deleteFunFact = async (req, res) => {
try{
//first step is to check req for correct format. 
if (!req?.body?.index) {
    return res.status(400).json({'message': 'Index and funfact required'});
    }

//next assign a local variable the desired state from the db
const stateObject = await funfact.findOne({code: req.params.state}).exec();  

//if this doesn't work, return an error
if (!stateObject) {
    return res.status(400).json({"message": `No funfact at index ${req.body.index} for state ${req.param.state} `})
}

//capture the index to delete from the body of the query
let bodyDeleteIndex = req.body.index;
//decrement it (because they can't send 0, their index must start at 1)
bodyDeleteIndex--; 

//make a copy of the array to be modified
const copyFunFactArray = stateObject.funfact; 

//make a blank array and define an index for it
const newFunFactArray=[]; 
let newIndex = 0; 

//this function takes the copy and copies it onto the new array, cutting out the array entry at the index the query specified. 
// The result is newFunFactArray that is the same minus the entry marked for deletion by the query body index. 

copyFunFactArray.forEach(element => {

    if(element != stateObject.funfact[bodyDeleteIndex] ){ 
    newFunFactArray[newIndex] = element;
    newIndex++; }
});

//now copy the new modified array back to the stateObject.funfact array. 
stateObject.funfact = newFunFactArray; 
//save this new object to the database
const result = await stateObject.save();  
//send the result. boom done. 
res.json(result);  

} catch (err) {
    console.error(err); 
}
}

const randomFunFact = async (req, res) => {

// assign a local variable the desired state from the db
const stateObject = await funfact.findOne({code: req.params.state}).exec();  
 
//if this doesn't work, return an error
if (!stateObject) {
    return res.status(400).json({"message": `No funfact for state ${req.param.state} `})
}

//assign a local variable the array from stateObject
const funfactArray = stateObject.funfact; 

//capture its length
const arrayLength = funfactArray.length;

//if for some reason the state exists in the DB but doesn't have a funfact, this will return the error message. 
if (arrayLength == 0) {
    return res.status(400).json({"message": `No funfact for state ${req.param.state} `})
}

//generate a random index based on the length of the array in the DB. Math.random returns a number between 0 and 1. Multiply that by the length
//and round down. Ex: 3 entries yield the result 0, 1 or 2. Perfect. 
const randomIndex = Math.floor(Math.random() * (arrayLength)); 

//console.log(randomIndex); 
res.json({funfact: funfactArray[randomIndex]} ); 



}



const dummyController = (req, res)=> {
//two ways to return simple json and text. 
//res.send(`The request state is: ${req.params.state}`);
res.json({"dummy": req.body});

}

module.exports = {
    getAllStates,
    getSingleState,
    stateCapital,
    stateNickName,
    statePopulation,
    stateAdmission,
    createNewFunFact,
    updateFunFact,
    deleteFunFact,
    randomFunFact, 
    dummyController
}