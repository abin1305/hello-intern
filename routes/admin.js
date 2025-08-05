const express = require('express');
const router = express.Router();
const userHelpers = require('../helpers/user helper');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // or diskStorage
// Admin Home Page (Optional)
router.get('/', (req, res) => {
  res.render('admin/layout', {
    title: 'Admin Panel',
    admin: req.session.intern, // assuming you're storing admin/intern in session
  });
});

// Add Interns Page
router.get('/add-interns', (req, res) => {
  res.render('admin/add-interns', {
    title: 'Add Interns',
    admin: req.session.intern, // display logged-in admin/intern if needed
  });
});

// Leaderboard Dashboard Page
router.get('/dashboard', async (req, res) => {
  const internName = req.session.intern?.name;

  if (!internName) return res.redirect('/signin'); // or appropriate route

  const data = await userHelpers.getInternLeaderboardData(internName);

  res.render('/dashboard', {
    name: internName,
    rewards: data?.rewards || 0,
    position: data?.position || 'N/A',
    donation: data?.donation || 0,
    active: data?.active || 0,
    reference: data?.reference || 'N/A',
  });
});





router.post('/add-intern', upload.array('images', 4), async (req, res) => {
  try {
    const sessionName = req.session.intern?.name;
    const response = await userHelpers.addLeaderboardEntry(req.body, sessionName);
    console.log('Submitted intern data:', req.body);
console.log('Uploaded files:', req.files);


    if (response.status) {
      res.redirect('/dashboard');
    } else {
      res.status(401).send(response.message);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
