var User = require('./models/user');
var books = require('google-books-search');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/search', function (req, res) {
        res.render('search.ejs');

    })
    
    app.get('/searchbook/:bookTitle', function (req, res) {
        books.search(req.params.bookTitle, function(error, results) {
            if ( ! error ) {
                console.log(results);
                res.json(results);
            } else {
                console.log(error);
            }
        });
    })

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/user',function (req, res) {
        res.json(req.user._id);
    });

    app.put('/addBook',function (req, res) {
        console.log("adding book");
        console.log(req.session.passport.user.id);
       User.findOne({_id: req.user._id}, function(err, user){
           if (err) {
               console.log("err finding usr");
               res.status(500).send(err);
           } else {
               console.log("pusing books")
               // Update each attribute with any possible attribute that may have been submitted in the body of the request
               // If that attribute isn't in the request body, default back to whatever it was before.
               if(!user.books){
                   user.books = [];
               }
               user.books.push(req.body);

               // Save the updated document back to the database
               user.save((err, user) => {
                   console.log("saving");
                   if (err) {
                       console.log("err saving book");
                       res.status(500).send(err)
                   }
                   console.log(user.books);
                   res.status(200).json(user.books);
           });
           }
       })
    });

    app.get('/tst', function (req,res) {
        console.log(req.user._id);
        User.findOne({ _id: '5a2ef4357f5c85172d05e214' }, function (err, obj) {
            console.log(obj);
        });
    })
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
