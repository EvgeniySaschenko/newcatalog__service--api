let express = require('express');
let router = express.Router();

router.use('/sections', require('./sections'));
router.use('/users', require('./users'));
router.use('/ratings', require('./ratings'));
router.use('/labels', require('./labels'));
router.use('/ratings-items', require('./ratings-items'));
router.use('/sites', require('./sites'));
router.use('/cashe', require('./cashe'));

module.exports = router;
