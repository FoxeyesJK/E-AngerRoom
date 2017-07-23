var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/user"),
    methodOverride  =   require("method-override"),
    Email  = require("./models/profile"),
    flash = require("connect-flash"),
    moment      = require("moment")
    //seedDB      = require("./seeds")


mongoose.connect(process.env.DATABASEURL);
//mongoose.connect("mongodb://localhost/e_anger_room");
//mongoose.connect("mongodb://foxeyes:kwonj1jw@ds031541.mlab.com:31541/e-angerroom");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());



// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.get("/", function(req, res){
    res.render("main");
});


//  ===========
// AUTH ROUTES
//  ===========

// show register form
app.get("/register", function(req, res){
   res.render("register"); 
});
//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to E-AngerRoom");
           res.redirect("/"); 
        });
    });
});



// show login form
app.get("/login", function(req, res){
   res.render("login"); 
});


// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login",
        successFlash: "You have successfully logged in.",
        failureFlash: "Login failed, you have entered incorrect credentials."
    }), function(req, res){
        
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   req.flash("success","Logged you out!");
   res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

/////////////////profile route
/*Email.create(
    {
        recipient: "kimew@gmail.com",
        subject: "I love you",
        contents: "I love you so much that I want to...."
    }, function(err, email){
        if(err){
            console.log(err);
        } else {
            console.log("Newly created");
            console.log(email);
        }
    });
*/
    
app.get("/profile", isLoggedIn, function(req, res){
    // Get all campgrounds from DB
    Email.find({id:req.user._id}, function(err, allEmails){
       if(err){
           console.log(err);
       } else {
          res.render("profile",{emails:allEmails});
       }
    });
});


app.post("/profile", function(req, res){
    var recipient = req.body.recipient;
    var subject = req.body.subject;
    var contents = req.body.contents;
    var today = moment(Date.now()).format('MM/DD/YYYY');
    //var id = require('mongodb').ObjectID(req.user._id);
    var id = req.user._id.toString();
    
    var newEmail = {recipient: recipient, subject: subject, contents: contents, today: today, id: id}

    Email.create(newEmail,function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect('/profile');
        }
     });
});

app.get("/profile/:id", isLoggedIn, function(req, res){
    
    Email.find({id:req.user._id}, function(err, allEmails){
       if(err){
           console.log(err);
       } else {
          res.render("email",{emails:allEmails});
       }
    });
});

 

//Comments Create
/*router.post("/",isLoggedIn,function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               campground.comments.push(comment);
               campground.save();
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});*/



/*app.get("/profile", function(req, res){
    //find the campground with provided ID
    Email.findById(req.params.id, function(err, foundEmail){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("profile", {emails: foundEmail});
        }
    });
});*/

app.delete("/profile/:_id", function(req, res){
    Email.findByIdAndRemove(req.params._id, function(err){
    
       if(err){
           console.log(err);
       } else {
    
          res.redirect('/profile');
       }
    });
});

app.get('/email', function(req, res) {
    var number=50;
    res.send(number);
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});