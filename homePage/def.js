var __extends = (this && this.__extends) || function (child, parent) {
    for (var p in parent) if (parent.hasOwnProperty(p)) child[p] = parent[p];
    function __() { this.constructor = child; }
    __.prototype = parent.prototype;
    child.prototype = new __();
};

var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var FdfsClient = require('fdfs');
var fs = require("fs");

var upload = multer({ dest: 'uploads/' }); 
var app = express();
//app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});
eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');

/*http://stackoverflow.com/questions/7990890/how-to-implement-login-auth-in-node-js/8003291#8003291
1) Check if the user is authenticated: I have a middleware function named CheckAuth which I use on every route that needs the user to be authenticated:

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}
I use this function in my routes like this:

app.get('/my_secret_page', checkAuth, function (req, res) {
  res.send('if you are viewing this page it means you are logged in');
});
2) The login route:

app.post('/login', function (req, res) {
  var post = req.body;
  if (post.user === 'john' && post.password === 'johnspassword') {
    req.session.user_id = johns_user_id_here;
    res.redirect('/my_secret_page');
  } else {
    res.send('Bad user/pass');
  }
});
3) The logout route:

app.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/login');
});      */