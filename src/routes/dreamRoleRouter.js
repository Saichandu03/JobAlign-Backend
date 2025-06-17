const express = require("express");
const Router = express.Router();

const {addDreamRole} = require('../controllers/dreamRoleController')


Router.post('/addDreamRole', addDreamRole);


module.exports = Router;

