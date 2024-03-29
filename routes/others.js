// routes/others.js

const express = require('express');
const { homeController, logoutController, validateQuotation } = require('../controllers/othersController');
const router = express.Router();

router.get('/', homeController);
router.get('/logout', logoutController);
router.get('/quotations/validate/:quotationCode/:revisionNumber', validateQuotation);


module.exports = router;
