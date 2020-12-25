const express = require('express');
const router = express.Router();
const User = require('../models/user-model')
const jwt = require('jsonwebtoken');
const accessTokenSecret = 'gygysbdkowufrdq31567189';

const refreshTokenSecret = 'skjysusiuusoisiugsfsfysf';
const refreshTokens = [];

const authToken = require('../auth')

// register user with hashed password
router.post('/users', (req, res, next) => {

    console.log(req.body)
    //res.send(req.body)
    let data = new User ({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        address: req.body.address,
    })
    console.log(data)

    data.save(function(err)  {
        if (err) next(err);
        res.send(data)
    })
})

// login user. On successful login send auth token and refresh token
router.post('/login' , (req, res, next) => {
    console.log(req.body)

    let data = {
        email : req.body.email,
        password : req.body.password
    }

        // fetch the user and test password verification
    User.findOne({ email: data.email }, function(err, user) {
        console.log(user)
        if (err) next(err);
        
        if(user) {

            let user_id = user.id
            // check password
        user.comparePassword(data.password, function(err, isMatch) {
            if (err) next(err);
            console.log(isMatch); // -&gt; Password123: true
            console.log(user.id)
            if (user) {
                // generate an access token
                const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret, { expiresIn: '20m' });
                const refreshToken = jwt.sign({ username: user.username, role: user.role }, refreshTokenSecret);
        
                refreshTokens.push(refreshToken);
        
                res.json({
                    accessToken,
                    refreshToken,
                    user_id
                });
            } else {
                res.send('Username or password incorrect');
            }
        });
        }

        else {
            res.send(404, { error: "User not found" });

        }
        
        
});
})

// refresh token
router.post('/token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }

    jwt.verify(token, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret, { expiresIn: '20m' });

        res.json({
            accessToken
        });
    });
});

// Logout user
router.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(token => t !== token);

    res.send("Logout successful");
});

// list all users with pagination
router.get('/users',  (req, res, next) => {

    User.find().then(data => {
        res.send(data)
    }).catch(next)
})


// list one user
router.get('/users/:id', (req, res, next) => {

    User.findById(req.params.id).then(data => {
        if (data) {
            res.send(data)
            
        }
        else {
            res.send("no user found")
        }
    }).catch(next)
})


// Update user with token
router.patch('/users/:id', authToken, (req, res, next) => {

    var opts = { runValidators: true };

    User.findByIdAndUpdate({ _id: req.params.id }, req.body, opts).then(() => {
        User.findOne({ _id: req.params.id }).then(data => {
            res.send(data)
        }).catch(next)
    }).catch(next)

})


router.delete('/users/:id', (req, res, next) => {

    User.findByIdAndRemove({ _id: req.params.id }).then(data => {
        if (data) {
            res.send("successfully deleted")
        }
        else {
            res.send("No user found")
        }
    }).catch(next)
})



module.exports = router