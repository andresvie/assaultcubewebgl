var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.get('/:id/test/:data', function(req, res) {
  console.log(req.params.id);
  console.log(req.params.data);
  res.send('respond with a resource');
});

module.exports = router;
