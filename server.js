var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var path = require('path');

var passport = require('passport');
var social = require('./app/passport/passport')(app, passport);

//Port
var port = process.env.PORT || 3000;

//Morgan Middleware
app.use(morgan('dev'));

//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//Static Folder (Frontend Middleware)
app.use(express.static(__dirname + '/public'));

//Routes Middleware
app.use('/api',appRoutes);

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'dev'
if(env == 'dev'){
    mongoose.connect('mongodb://localhost:27017/photo-app', function(err){
        if(err){
            console.log('Not Connected to database: ' + err);
        }
        else {
            console.log('Connected to MongoDB...');
        }
    });
    }
else{
    mongoose.connect('mongodb://admin_usermanagement:dhruvpatel@ds137100.mlab.com:37100/usermanagement', function(err){
        if(err){
            console.log('Not Connected to database: ' + err);
        }
        else {
            console.log('Connected to MongoDB...');
        }
    });
}


app.get('*', function(req, res){
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(port, function(){
    console.log('Server running at port ' + port);
});
