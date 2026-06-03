const express = require('express');


const router = express.Router();

router.get('/seo', seoController.getSEOData);

module.exports = router;