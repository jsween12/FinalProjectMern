const express = require('express');
const { get } = require('express/lib/response');
const router = express.Router();
const path = require('path');
const statesController = require('../../controllers/statesController');
const { verifyState } = require('../../middleware/verifyState');


router.route('/')
    .get(statesController.getAllStates)
    .post()
    .put()
    .delete();




router.route('/:state')
    .get( verifyState(), statesController.getSingleState);


router.route('/:state/capital')
    .get(verifyState(), statesController.stateCapital); 

router.route('/:state/nickname')
    .get(verifyState(), statesController.stateNickName); 

router.route('/:state/population')
    .get(verifyState(), statesController.statePopulation); 

router.route('/:state/admission')
    .get(verifyState(), statesController.stateAdmission); 

router.route('/:state/funfact')
    .post(verifyState(), statesController.createNewFunFact)
    .get(verifyState(), statesController.randomFunFact) 
    .patch(verifyState(), statesController.updateFunFact)
    .delete(verifyState(), statesController.deleteFunFact); 



module.exports = router;