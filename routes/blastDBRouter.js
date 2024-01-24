const express = require('express');
const {
  addPeople,
  getPeople,
  findPerson,
} = require('../controllers/blastDBController');
const blastDBRouter = express.Router();

blastDBRouter.get('/add-people/:number', addPeople);
blastDBRouter.get('/get-people', getPeople);
blastDBRouter.get('/find-person/:id', findPerson);

module.exports = { blastDBRouter };
