const express = require('express');
const seoController = require('../controller/seoController');


const router = express.Router();

router.post('/get', seoController.getSEOData);

module.exports = router;