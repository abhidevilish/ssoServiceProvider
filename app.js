const passport = require('passport')
const SamlStrategy = require('passport-saml').Strategy;
const express = require('express');
const app = express()
const pool = require('./db')
const constants = require('./constants')

app.use(express.json())
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
// app.use(express.urlencoded())

let cert1 = require('fs').readFileSync(__dirname + '/testAppFiles/AWS_SSO_for_Custom SAML 2.0 application_certificate2.pem', 'utf8')

var samlStrategy = new SamlStrategy({
    //callbackUrl: 'http://43.204.223.103:3001/api/login/callback',
    //callbackUrl: 'https://csrg.lightstorm.in/ltc/ssoapi/login/callback',
    //entryPoint:'https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MTAyODgxNzE3MjkyX2lucy02ZjZiMzYwMmJjYWM3NTFl',
    entryPoint:"https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MzczNzYxNTEwMDExX2lucy1hYWYyNjdmZmU4NjhjNzNk",
    issuer: "https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MzczNzYxNTEwMDExX2lucy1hYWYyNjdmZmU4NjhjNzNk",
    logoutUrl: "https://portal.sso.ap-south-1.amazonaws.com/saml/logout/MzczNzYxNTEwMDExX2lucy1hYWYyNjdmZmU4NjhjNzNk",
    cert: cert1
}, function (profile, done) {
    console.log('Profile: %j', profile);
    return done(null, profile);
});

passport.use(samlStrategy);

app.get('/login/fail', (req, res) => res.send(`<p> test </p>`))

app.get('/', (req, res) => res.send(`<p> AttemptedUrl </p>`))

app.get('/.well-known/pki-validation/:Id', (req, res) => res.sendFile(__dirname + '/' + req.params.Id))


app.get('/ssoapi',
    passport.authenticate('saml', { failureRedirect: '/login/fail' }),
    function (req, res) {
        console.log("Api SSo was called")
        res.redirect('/');
    }
);

app.post('/ssoapi/login/callback',
    passport.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }),
    function (req, res) {
        console.log('reqqqqqqqqq', req)
        res.redirect('/');
    }
);

// app.post('/api/authorizeUser', (req, res) => {
//     pool.query(`select EmailId from usermst where EmailId = '${req.body.emailId}'  `, (err, result, fields) => {
//         if (err) {
//             res.status(500).send({ error: err })
//         }
//         else {
//             console.log(result)
//             if (result.length && result[0].EmailId) {
//                 //res.status(200).send("done")
//                 res.redirect('/')
//             }
//             else {
//                 res.status(403).send()
//             }

//         }
//     })
// })


app.listen(constants.PORT_NO, () => console.log("Server is listening on port", constants.PORT_NO))