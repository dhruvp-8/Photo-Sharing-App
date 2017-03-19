var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'hello';

module.exports = function(app, passport){

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ secret: 'keyboard cat', resave: false , saveUninitialized: true, cookie: { secure: false } }));

    passport.serializeUser(function(user, done) {
        if(user.active){
            token = jwt.sign({ username: user.username, email: user.email, name: user.name }, secret, {expiresIn: '24h'});
        }
        else{
            token = 'inactive/error';
        }
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
        clientID: '378534625855609',
        clientSecret: 'eb9b5ac04b6d88e003290c3e26df11f3',
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile._json.email);
    User.findOne({ email: profile._json.email }).select('username password email name prof_photo active').exec(function(err, user){
        if(err) done(err);

        if(user && user != null){
            console.log(user);
            done(null, user);
        }
        else{
            done(err);
        }
    });
  }
));

    app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res){
        res.redirect('/facebook/' + token);
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

    return passport;
};
