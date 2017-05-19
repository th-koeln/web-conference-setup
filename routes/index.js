//INDEX
var ejs = require('ejs');

// Rendering the frontpage
exports.render = function() {
  return function(req, res) {
	  res.render('index.ejs', {});
  }
}