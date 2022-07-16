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

let cert1 = require('fs').readFileSync(__dirname + '/testFiles/AWS_SSO_for_Custom SAML 2.0 application_certificate.pem', 'utf8')

let cert = require('fs').readFileSync(__dirname + '/AWS_SSO_for_Custom SAML 2.0 application_certificate.pem', 'utf8')
var samlStrategy = new SamlStrategy({
    //decryptionPvk: pvk,
    //callbackUrl: 'http://43.204.223.103:3001/api/login/callback',
    //callbackUrl: 'https://csrg.lightstorm.in/ltc/ssoapi/login/callback',
    //entryPoint:'https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MTAyODgxNzE3MjkyX2lucy02ZjZiMzYwMmJjYWM3NTFl',
    entryPoint: 'https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MDYxNTg0ODc3NTQ4X2lucy1jNjUzODVlM2EwZTAxZjhm',
    //issuer: 'https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MTAyODgxNzE3MjkyX2lucy02ZjZiMzYwMmJjYWM3NTFl',
    //logoutUrl:'https://portal.sso.ap-south-1.amazonaws.com/saml/logout/MTAyODgxNzE3MjkyX2lucy02ZjZiMzYwMmJjYWM3NTFl',
    cert: cert1
}, function (profile, done) {
    console.log('Profile: %j', profile);
    return done(null, profile);
});

passport.use(samlStrategy);

app.get('/login/fail', (req, res) => res.send(`<p> test </p>`))

app.get('/', (req, res) => res.send(`<p> AttemptedUrl </p>`))

app.get('/.well-known/pki-validation/:Id', (req, res) => res.sendFile(__dirname + '/' + req.params.Id))


app.get('/ssoapi/',
    passport.authenticate('saml', { failureRedirect: '/login/fail' }),
    function (req, res) {
        res.send('Hello World!');
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