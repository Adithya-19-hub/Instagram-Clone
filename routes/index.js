const express = require('express');
const router = express.Router();
const model = require('./users');
const postdata = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');

passport.use(new localStrategy(model.authenticate()));

/* GET SignUp page. */
router.get('/', function (req, res) {
  let params = { title: 'SignUp Instagram' }
  res.status(200).render('signup', { params });
});


/* GET Login page. */
router.get('/login', function (req, res) {
  let params = { title: 'Login Instagram', error: req.flash('error') }
  res.status(200).render('login', { params });
});


/* GET Profile page. */
router.get('/profile', isLoggedIn, async function (req, res) {
  let user = await model.findOne({ username: req.session.passport.user }).populate('posts');
  let params = { title: 'Profile Page' };
  res.status(200).render('profile', { params, user });
});

/* GET Edit page. */
router.get('/edit', isLoggedIn, async function (req, res) {
  let user = await model.findOne({ username: req.session.passport.user });
  let params = { title: 'Edit Page' };
  res.status(200).render('edit', { params, user });
});


/* GET Feed page. */
router.get('/feed', isLoggedIn, async function (req, res) {
  let user = await model.findOne({ username: req.session.passport.user }).populate('posts');
  let post = await postdata.find().populate('user');
  let params = { title: 'Feed Page' };
  res.status(200).render('feed', { params, user, post });
});

/* GET Post page. */
router.get('/post', isLoggedIn, async function (req, res) {
  let user = await model.findOne({ username: req.session.passport.user });
  let params = { title: 'Post Page' };
  res.status(200).render('post', { params, user });
});

// User can create post
router.post('/createpost', isLoggedIn, upload.single('image'), async function (req, res) {
  let user = await model.findOne({ username: req.session.passport.user });
  let post = await postdata.create({
    caption: req.body.caption,
    image: req.file.filename,
    user: user._id
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});


// User's Signup details
router.post('/register', function (req, res) {
  let { username, email, fullname } = req.body;

  let userdata = new model({
    username,
    email,
    fullname
  });

  model.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile');
      });
    });
});


/* Navigating to the Profile page after entering login details*/
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}), function (req, res) {

});

// User adds profile , username, and bio details
router.post('/update', isLoggedIn, upload.single('image'), async function (req, res) {
  let user = await model.findOneAndUpdate({ username: req.session.passport.user },
    { bio: req.body.bio }, { username: req.body.username }, { fullname: req.body.fullname }
  );

  if (req.file) {
    user.image = req.file.filename;
  }
  await user.save();
  res.status(200).redirect('/profile');
});

// Like feature
router.get('/like/post/:id', isLoggedIn, async function (req, res) {
  let user = await model.findOne({ username: req.session.passport.user });
  let post = await postdata.findOne({ _id: req.params.id });

  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  }
  else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }

  await post.save();
  res.redirect('/feed');
});


/* Navigating to the Home page after logging out */
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

/* Protected Route */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
};

module.exports = router;
