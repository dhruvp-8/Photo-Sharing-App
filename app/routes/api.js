var User = require('../models/user'); // Import User Model
var jwt = require('jsonwebtoken'); // Import JWT Package
var multer = require('multer');
var secret = 'harrypotter'; // Create custom secret for use in JWT

//Multer storage configs
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/uploads/');
  },
  filename: function (req, file, cb) {
      if(!file.originalname.match(/\.(png|jpeg|jpg|JPG|JPEG|PNG)$/)){
          var err = new Error();
          err.code = 'filetype';
          return cb(err);
      }
      else{
          cb(null, Date.now() + '_' + file.originalname);
      }
  }
});

//Multer upload configs
var upload = multer({
    storage: storage,
    limits : {fileSize: 10000000}
 }).single('myFile');



module.exports = function(router) {


    router.post('/users', function(req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.name = req.body.name;

        // Check if request is valid and not empty or null
        if (req.body.username === null || req.body.username === '' || req.body.password === null || req.body.password === '' || req.body.email === null || req.body.email === '' || req.body.name === null || req.body.name === '') {
            res.json({ success: false, message: 'Ensure username, email, and password were provided' });
        } else {
            // Save new user to database
            user.save(function(err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors != null) {
                        if (err.errors.name) {
                            res.json({ success: false, message: err.errors.name.message }); // Display error in validation (name)
                        } else if (err.errors.email) {
                            res.json({ success: false, message: err.errors.email.message }); // Display error in validation (email)
                        } else if (err.errors.username) {
                            res.json({ success: false, message: err.errors.username.message }); // Display error in validation (username)
                        } else if (err.errors.password) {
                            res.json({ success: false, message: err.errors.password.message }); // Display error in validation (password)
                        } else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else {
                        if(err){
                            res.json({ success: false, message: 'Username or Email is already taken' }); // Display error if username already taken
                        }
                    }
                } else {
                    res.json({ success: true, message: 'Account registered!.' }); // Send success message back to controller/request
                }
            });
        }
    });

    // Route to check if username chosen on registration page is taken
    router.post('/checkusername', function(req, res) {
        User.findOne({ username: req.body.username }).select('username').exec(function(err, user) {
            if (err) throw err;

            if (user) {
                res.json({ success: false, message: 'That username is already taken' }); // If user is returned, then username is taken
            } else {
                res.json({ success: true, message: 'Valid username' }); // If user is not returned, then username is not taken
            }
        });
    });

    // Route to check if e-mail chosen on registration page is taken
    router.post('/checkemail', function(req, res) {
        User.findOne({ email: req.body.email }).select('email').exec(function(err, user) {
			if(err) throw err;

            if (user) {
                res.json({ success: false, message: 'That e-mail is already taken' }); // If user is returned, then e-mail is taken
            } else {
                res.json({ success: true, message: 'Valid e-mail' }); // If user is not returned, then e-mail is not taken
            }
        });
    });

    // Route for user logins
    router.post('/authenticate', function(req, res) {
        User.findOne({ username: req.body.username }).select('name email username password prof_photo').exec(function(err, user) {
            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Username not found' }); // Username not found in database
            } else if (user) {
                // Check if user does exist, then compare password provided by user
                if (req.body.password) {
                    var validPassword = user.comparePassword(req.body.password);
                     // Password was not provided
                } else {
                    res.json({ success: false, message: 'No password provided' });
                }
                if (!validPassword) {
                        res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
                }else {
                        var token = jwt.sign({ username: user.username, email: user.email,name: user.name, prof_photo: user.prof_photo}, secret, { expiresIn: '30m' }); // Logged in: Give user token
                        res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller
                }
            }
        });
    });



//Upload Route
router.post('/upload', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
        if(err.code == 'LIMIT_FILE_SIZE'){
            res.json({success: false, message: 'File Size is too large. Max limit is 10MB!'});
        }
        else if(err.code == 'filetype'){
            res.json({success: false, message: 'File type is invalid. Must be .png, .jpg, .jpeg!'});
        }
        else{
            console.log(err);
            res.json({success: false, message: 'File was not able to upload!'});
        }
    }
    else{
        if(!req.file){
            res.json({success: false, message: 'No File was selected!'});
        }
        else{
            User.findOneAndUpdate({username: req.body.uid},{ prof_photo: req.file.filename }).exec(function(err, doc){
                if(err) throw err;
                doc.save();
            });
            res.json({success: true, message: 'File was uploaded!', url: req.file.filename});
        }
    }

    });
});

    // Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

        // Check if token is valid and not expired
        if (token) {
            // Function to verify token
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
                } else {
                    req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
                    next(); // Required to leave middleware
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
        }
    });

    // Route to get the currently logged in user
    router.post('/me', function(req, res) {
        res.send(req.decoded); // Return the token acquired from middleware
    });

     router.get('/renewToken/:username', function(req,res){
        User.findOne({ username: req.params.username }).select().exec(function(err, user){
            if(err) throw err;
            if(!user){
                res.json({ success: false, message: 'No User was found' });
            }
            else{
                var newToken = jwt.sign({ username: user.username, email: user.email,name: user.name, prof_photo: user.prof_photo}, secret, { expiresIn: '24h' }); // Logged in: Give user token
                res.json({ success: true, token: newToken }); // Return token in JSON object to controller
            }
        });
     });

     router.get('/permission', function(req, res){
        User.findOne({ username: req.decoded.username }, function(err, user){
            if(err) throw err;
            if(!user){
                res.json({ success: false, message:'No User was found' });
            }
            else{
                res.json({ success:true, permission: user.permission });
            }
        });
     });

     router.get('/management', function(req, res){
        User.find({}, function(err, users){
            if(err) throw err;

            User.findOne({ username: req.decoded.username }, function(err, mainUser){
                if(err) throw err;

                if(!mainUser){
                    res.json({ success:false, message: 'No User Found' });
                }else{
                    if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                        if(!users){
                            res.json({ success:false, message:'Users not found' });
                        }else{
                            res.json({ success:true, users: users, permission: mainUser.permission });
                        }
                    }
                    else{
                        res.json({ success: false, message: 'Insufficient Permissions' });
                    }
                }
            });
        });
     });



    /*router.get('/search', function(req, res) {
      User.find({}, function(err, users) {
        var userMap = [];

        users.forEach(function(user) {
            userMap.push(user);
        });

        res.json(userMap);
      });
  });*/

    /*router.post('/request', function(req,res){
        var incoming = req.body.incoming;
        var outgoing = req.body.outgoing;
        User.findByIdAndUpdate(incoming, {$push: {"incomingreq": {rid: outgoing,flag: true}}},{safe: true, upsert: true}).exec(function(err, doc) {
            if(err) throw err;

            doc.save();
        });
        User.findByIdAndUpdate(outgoing,{$push: {"outgoingreq": {rid: incoming,flag:true}}},{safe: true, upsert: true}).exec(function(err, doc) {
            if(err) throw err;

            doc.save();
        });

        res.json({success: true});

    });*/

    return router; // Return the router object to server
};
