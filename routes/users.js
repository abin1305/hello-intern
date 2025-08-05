var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user helper');
const bcrypt = require('bcrypt'); // Add this at the top if not already
/* GET users listing. */


// routes/user.js
router.get('/dashboard', async (req, res) => {
  const internName = req.session.intern?.name;

  if (!internName) return res.redirect('/signin');

  const data = await userHelpers.getInternLeaderboardData(internName);

  res.render('user/dashboard', {
    name: internName,
    rewards: data?.rewards || 0,
    position: data?.position || 'N/A',
    donation: data?.donation || 0,
    active: data?.active || 0,
    reference: data?.reference || 'N/A',
  });
});


router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Homepage',
    user: req.user // Assuming you have user data in req.user)
  });
});


router.get('/leaderboard', function(req, res, next) {
  res.render('user/leaderboard', {
    title: 'Leaderboard',
    user: req.user // Assuming you have user data in req.user)
  });
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const intern = await userHelpers.getInternByEmail(email);

    if (!intern) {
      return res.render('user/signin', { title: 'Sign In', error: 'User not found' });
    }

    // Use bcrypt to compare hashed password
    const isMatch = await bcrypt.compare(password, intern.password);
    if (!isMatch) {
      return res.render('user/signin', { title: 'Sign In', error: 'Invalid password' });
    }

    req.session.intern = {
      name: intern.name,
      email: intern.email
    };

    console.log('Logged in session:', req.session.intern); // for debug

    res.redirect('/dashboard');

  } catch (err) {
    console.error(err);
    res.render('user/signin', { title: 'Sign In', error: 'Something went wrong' });
  }
});
router.get('/signin', (req, res) => {
  res.render('user/signin', { title: 'Sign In' });
}); 


router.get('/logout', function(req, res, next) {
  // If using Passport.js, uncomment the following:
  // req.logout(function(err) {
  //   if (err) { return next(err); }
  //   res.redirect('/');
  // });

  // If not using Passport.js, manually destroy the session:
  req.session.destroy(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/'); // Redirect to homepage after logout
  });
});




router.post('/signup', async (req, res) => {
    try {
        const response = await userHelpers.registerIntern(req.body);
        res.status(200).json({ status: true, message: 'Intern registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Signup failed' });
    }
});

// Route to check answer correctness
router.post('/check-answer', (req, res) => {
    const correctAnswer = 'impact'; // example correct answer
    const userAnswer = req.body.answer?.trim().toLowerCase();
    if (userAnswer === correctAnswer) {
        res.json({ correct: true });
    } else {
        res.json({ correct: false });
    }
});
module.exports = router;
