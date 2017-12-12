var User = require('./models/user');
var books = require('google-books-search');

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });


    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });


    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });



    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });


    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/search', function (req, res) {
        res.render('search.ejs',{user : req.user});

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
    });

    app.get('/getCollection',function (req, res) {
        User.findOne({_id: req.user._id}, function(err, user){
            if (err) {
                console.log("err finding usr");
                res.status(500).send(err);
            } else {

                if(!user.books){
                    user.books = [];
                }


                console.log(user.books);
                res.status(200).json(user.books);
            }
        })
    });

    app.delete('/delBook/:title',function (req, res) {
        console.log("in del route");
        User.findOne({_id: req.user._id}, function(err, user){
            if (err) {
                console.log("err finding usr");
                res.status(500).send(err);
            } else {

                if(!user.books){
                    user.books = [];
                }

                console.log("Begining search");

                for(var i = 0; i < user.books.length; i++){
                    console.log("pass number " + i);
                    if(user.books[i].title === req.params.title){
                        user.books.splice(i, 1);
                        break;
                    }
                }

                user.save((err, user) => {
                    console.log("saving");
                if (err) {
                    console.log("err saving book");
                    res.status(500).send(err)
                }
                //console.log(user.books);
                res.status(200).json(user.books);
            });

                // console.log(user.books);
                // res.status(200).json(user.books);
            }
        })
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
