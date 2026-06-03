const express = require('express');
const seoController = require('../controller/seoController');


const router = express.Router();

router.get('/seo', seoController.getSEOData);

module.exports = router;