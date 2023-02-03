let express = require('express');
let router = express.Router();

router.use('/sections', require('./sections'));
router.use('/users', require('./users'));
router.use('/ratings', require('./ratings'));
router.use('/ratings-labels', require('./ratings-labels'));
router.use('/ratings-items', require('./ratings-items'));
router.use('/cashe', require('./cashe'));

module.exports = router;
