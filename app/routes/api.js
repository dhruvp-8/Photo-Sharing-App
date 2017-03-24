var User = require('../models/user'); // Import User Model
var jwt = require('jsonwebtoken'); // Import JWT Package
var multer = require('multer');
var secret = 'harrypotter'; // Create custom secret for use in JWT

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


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

    var options = {
      auth: {
        api_user: 'dhruv16',
        api_key: 'Dhruv@454'
      }
    }

    var client = nodemailer.createTransport(sgTransport(options));

    router.post('/users', function(req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.name = req.body.name;
        user.temporarytoken = jwt.sign({ username: user.username, email: user.email,name: user.name, prof_photo: user.prof_photo}, secret, { expiresIn: '24h' });

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

                    var email = {
                      from: 'usermanagement1211@gmail.com',
                      to: user.email,
                      subject: 'User Management Activation Link',
                      text: 'Hello, ' + user.name + 'Thank You for registering at usermanagement.herokuapp.com.Please click on the link below to complete your activation! https://umsbasic.herokuapp.com/activate/'+ user.temporarytoken,
                      html: 'Hello, <strong> ' + user.name + '</strong><br><br>Thank You for registering at usermanagement.herokuapp.com.Please click on the link below to complete your activation!<br><br><a href="https://umsbasic.herokuapp.com/activate/' + user.temporarytoken +'">https://umsbasic.herokuapp.com/activate/'+ user.temporarytoken +'</a> '
                    };

                    client.sendMail(email, function(err, info){
                        if (err ){
                          console.log(err);
                        }
                        else {
                          console.log('Message sent: ' + info.response);
                        }
                    });

                    res.json({ success: true, message: 'Account registered! Please Check your Email for activation link.' }); // Send success message back to controller/request
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
        User.findOne({ username: req.body.username }).select('name email username password prof_photo active').exec(function(err, user) {
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
                }else if (!user.active) {
                    res.json({ success: false, message: 'Account is not yet activated. Please check your email (inside SPAM folder) for activation link.', expired: true});
                }
                else {
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

    router.put('/activate/:token', function(req,res){
        User.findOne({ temporarytoken: req.params.token }, function(err,user){
            if(err) throw err;
            var token = req.params.token;


            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Activation Link has expired!' }); // Token has expired or is invalid
                } else if(!user) {
                    res.json({ success: false, message: 'Activation Link has expired!' });
                }
                else{
                    user.temporarytoken = false;
                    user.active = true;
                    user.save(function(err){
                        if(err){
                            console.log(err);
                        }
                        else{

                            var email = {
                              from: 'usermanagement1211@gmail.com',
                              to: user.email,
                              subject: 'User Management Account Activated',
                              text: 'Hello, ' + user.name + 'Your account has been successfully activated!',
                              html: 'Hello, <strong> ' + user.name + '</strong><br><br>Your account has been successfully activated!'
                            };

                            client.sendMail(email, function(err, info){
                                if (err ){
                                  console.log(err);
                                }
                                else {
                                  console.log('Message sent: ' + info.response);
                                }
                            });

                            res.json({ success: true, message: 'Account Activated!' });
                        }
                    });
                }
            });

        });
    });


    router.post('/resend', function(req, res) {
        User.findOne({ username: req.body.username }).select('name email username password prof_photo active').exec(function(err, user) {
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
                }else if (user.active) {
                    res.json({ success: false, message: 'Account is already activated!'});
                }
                else {
                    res.json({ success: true, user: user });
                }
            }
        });
    });

    router.put('/resend', function(req,res){
        User.findOne({ username: req.body.username }).select('username email name prof_photo temporarytoken').exec(function(err,user){
            if(err) throw err;

            user.temporarytoken = jwt.sign({ username: user.username, email: user.email,name: user.name, prof_photo: user.prof_photo}, secret, { expiresIn: '24h' });
            user.save(function(err){
                if(err){
                    console.log(err);
                }
                else{
                    var email = {
                      from: 'usermanagement1211@gmail.com',
                      to: user.email,
                      subject: 'User Management Activation Link Request',
                      text: 'Hello, ' + user.name + 'You recently requested a new account activation link. Please click on the link below to complete your activation! https://umsbasic.herokuapp.com/activate/'+ user.temporarytoken,
                      html: 'Hello, <strong> ' + user.name + '</strong><br><br>You recently requested a new account activation link. Thank You for registering at usermanagement.herokuapp.com.Please click on the link below to complete your activation!<br><br><a href="https://umsbasic.herokuapp.com/activate/' + user.temporarytoken +'">https://umsbasic.herokuapp.com/activate/' + user.temporarytoken +'</a> '
                    };

                    client.sendMail(email, function(err, info){
                        if (err ){
                          console.log(err);
                        }
                        else {
                          console.log('Message sent: ' + info.response);
                        }
                    });

                    res.json({ success: true, message: 'Activation Link has been sent to '+ user.email + '!' });
                }
            });
        });
    });


    router.get('/resetusername/:email', function(req,res){
        User.findOne({ email: req.params.email }).select('email name username').exec(function(err,user){
            if(err){
                res.json({ success: false, message: err });
            }
            else{
                if(!req.params.email){
                    res.json({ success: false, message: 'No Email was provided!'  });
                }
                else{
                    if(!user){
                        res.json({ success: false, message: 'Email was not found!'  });
                    }else{

                        var email = {
                          from: 'usermanagement1211@gmail.com',
                          to: user.email,
                          subject: 'User Management Username Request',
                          text: 'Hello, ' + user.name + 'You recently requested your username. Please save it in your files: ' + user.username ,
                          html: 'Hello, <strong> ' + user.name + '</strong><br><br>You recently requested your username.<br><br> Please save it in your files: &nbsp;<strong>' + user.username + '</strong>'
                        };

                        client.sendMail(email, function(err, info){
                            if (err ){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                            }
                        });

                        res.json({ success:true, message: 'Username has been sent to Registered Email Address!' })
                    }
                }
            }

        });
    });


    router.put('/resetpassword',function(req,res){
        User.findOne({ username: req.body.username }).select('username active email resettoken name').exec(function(err,user){
            if(err) throw err;

            if(!user){
                res.json({ success: false, message: 'Username was not found' });
            }else if (!user.active) {
                res.json({ success: false, message: 'Account is not yet activated!' });
            }
            else{
                user.resettoken = jwt.sign({ username: user.username, email: user.email,name: user.name, prof_photo: user.prof_photo}, secret, { expiresIn: '24h' });
                user.save(function(err){
                    if(err){
                        console.log(err);
                    }
                    else{

                        var email = {
                          from: 'usermanagement1211@gmail.com',
                          to: user.email,
                          subject: 'User Management Reset Password Request',
                          text: 'Hello, ' + user.name + 'You recently requested password reset link. Please click on the link below to reset your password: https://umsbasic.herokuapp.com/reset/'+ user.resettoken,
                          html: 'Hello, <strong> ' + user.name + '</strong><br><br>You recently requested a new account activation link.<br><br>Please click on the link below to reset your password: <br><br><a href="https://umsbasic.herokuapp.com/reset/' + user.resettoken +'">https://umsbasic.herokuapp.com/reset/' + user.resettoken + '</a>'
                        };

                        client.sendMail(email, function(err, info){
                            if (err ){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                            }
                        });

                        res.json({ success:true, message: 'Please check your E-mail for Password Reset Link!' });
                    }
                });
            }
        });
    });

    router.get('/resetpassword/:token', function(req,res){
        User.findOne({ resettoken:  req.params.token }).select().exec(function(err,user){
            if(err) throw err;
            var token = req.params.token;

            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Password Link has expired' }); // Token has expired or is invalid
                } else {
                    if(!user){
                        res.json({ success: false, message: 'Password Link has expired.' });
                    }
                    else{
                        res.json({ success: true, user: user });
                    }
                }
            });

        });
    });

    router.put('/savepassword', function(req,res){
        User.findOne({ username: req.body.username }).select('username name password resettoken email').exec(function(err,user){
            if(err) throw err;

            if(req.body.password == null || req.body.password == ''){

                res.json({ success: false, message: 'Password not provided.' });
            }
            else{
                user.password = req.body.password;
                user.resettoken = false;
                user.save(function(err){
                    if(err){
                        console.log(err);
                    }
                    else{

                        var email = {
                          from: 'usermanagement1211@gmail.com',
                          to: user.email,
                          subject: 'User Management Password Reset',
                          text: 'Hello, ' + user.name + 'This email is to notify you that you password has been recently resetted!',
                          html: 'Hello, <strong> ' + user.name + '</strong><br><br>This email is to notify you that you password has been recently resetted!'
                        };

                        client.sendMail(email, function(err, info){
                            if (err ){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                            }
                        });

                        res.json({ success:true, message: 'Password has been reset!' });
                    }
                });
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

     router.delete('/management/:username', function(req, res){
        var deletedUser = req.params.username;
        User.findOne({ username: req.decoded.username }, function(err, mainUser){
            if(err) throw err;

            if(!mainUser){
                res.json({ success:false, message: 'No User Found' });
            }else{
                if(mainUser.permission !== 'admin'){
                    res.json({ success: false, message: 'Insufficient Permissions' });
                }
                else{
                    User.findOneAndRemove({ username: deletedUser }, function(err, user){
                        if(err) throw err;
                        res.json({ success:true });
                    });
                }
            }
        });
     });

     router.get('/edit/:id', function(req,res){
         var editUser = req.params.id;

         User.findOne({ username: req.decoded.username }, function(err, mainUser){
             if(err) throw err;

             if(!mainUser){
                 res.json({ success:false, message: 'No User Found' });
             }else{
                 if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                     User.findOne({ _id: editUser }, function(err, user){
                         if(err) throw err;
                         if(!user){
                            res.json({ success:false,message: 'No User Found'});
                         }
                         else{
                             res.json({ success:true, user: user});
                         }
                     });
                 }
                 else{
                     res.json({ success: false, message: 'Insufficient Permissions' });
                 }
             }
         });
     });

     router.put('/edit', function(req, res) {
        var editUser = req.body._id;
        if (req.body.name) var newName = req.body.name;
        if (req.body.username) var newUsername = req.body.username;
        if (req.body.email) var newEmail = req.body.email;
        if (req.body.permission) var newPermission = req.body.permission;

        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if(err)  console.log(err);
            if (!mainUser) {
                res.json({ success: false, message: "no user found" });
            } else {
                if (newName) {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        User.findOne({ _id: editUser }, function(err, user) {
                            if(err) throw err;

                            if (!user) {
                                res.json({ success: false, message: 'No user found' });
                            } else {
                                user.name = newName; // Assign new name to user in database
                                        // Save changes
                                user.save(function(err) {
                                    if (err) {
                                        console.log(err); // Log any errors to the console
                                    } else {
                                        res.json({ success: true, message: 'Name has been updated!' }); // Return success message
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    }
                }

                    // Check if a change to username was requested
                if (newUsername) {
                        // Check if person making changes has appropriate access
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user in database
                        User.findOne({ _id: editUser }, function(err, user) {
                                if(err) throw err;
                                if (!user) {
                                    res.json({ success: false, message: 'No user found' }); // Return error
                                } else {
                                    user.username = newUsername; // Save new username to user in database
                                        // Save changes
                                    user.save(function(err) {
                                        if (err) {
                                            console.log(err); // Log error to console
                                        } else {
                                            res.json({ success: true, message: 'Username has been updated' }); // Return success
                                        }
                                    });
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if change to e-mail was requested
                    if (newEmail) {
                        // Check if person making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user that needs to be editted
                            User.findOne({ _id: editUser }, function(err, user) {
                                if(err) throw err;
                                if (!user) {
                                    res.json({ success: false, message: 'No user found' }); // Return error
                                } else {
                                    user.email = newEmail; // Assign new e-mail to user in databse
                                        // Save changes
                                    user.save(function(err) {
                                        if (err) {
                                            console.log(err); // Log error to console
                                        } else {
                                            res.json({ success: true, message: 'E-mail has been updated' }); // Return success
                                        }
                                    });
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if a change to permission was requested
                    if (newPermission) {
                        // Check if user making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user to edit in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if(err) throw err;
                                if (!user) {
                                    res.json({ success: false, message: 'No user found' }); // Return error
                                } else {
                                        // Check if attempting to set the 'user' permission
                                    if (newPermission === 'user') {
                                            // Check the current permission is an admin
                                        if (user.permission === 'admin') {
                                                // Check if user making changes has access
                                            if (mainUser.permission !== 'admin') {
                                                res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade an admin.' }); // Return error
                                            } else {
                                                user.permission = newPermission; // Assign new permission to user
                                                    // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Long error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            }
                                        } else {
                                            user.permission = newPermission; // Assign new permission to user
                                                // Save changes
                                            user.save(function(err) {
                                                if (err) {
                                                    console.log(err); // Log error to console
                                                } else {
                                                    res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                }
                                            });
                                        }
                                    }
                                        // Check if attempting to set the 'moderator' permission
                                        if (newPermission === 'moderator') {
                                            // Check if the current permission is 'admin'
                                            if (user.permission === 'admin') {
                                                // Check if user making changes has access
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin' }); // Return error
                                                } else {
                                                    user.permission = newPermission; // Assign new permission
                                                    // Save changes
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); // Log error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission; // Assign new permssion
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            }
                                        }

                                        // Check if assigning the 'admin' permission
                                        if (newPermission === 'admin') {
                                            // Check if logged in user has access
                                            if (mainUser.permission === 'admin') {
                                                user.permission = newPermission; // Assign new permission
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            } else {
                                                res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade someone to the admin level' }); // Return error
                                            }
                                        }
                                    }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                }
        });
    });


    return router; // Return the router object to server
};
