


const verifyState = () => {
    return (req, res, next) => {
    
    let statesDataArray = require('../model/states.json');

    const AbbrUpperCase = req.params.state.toUpperCase(); 
    console.log(AbbrUpperCase);
    
    const stateCodes = statesDataArray.map(st =>st.code); 

   const isState = stateCodes.find(stateCode => stateCode === AbbrUpperCase); 
   console.log("isSTate = " + isState); 

    if(!isState) return res.status(400).json({message: "Invalid state abbreviation parameter" }); 
    

    req.params.state = isState; 

    console.log("req.code = " + req.code); 
    next();
}
}

module.exports = { verifyState };