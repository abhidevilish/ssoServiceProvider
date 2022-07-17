const passport = require('passport')
const SamlStrategy = require('passport-saml').Strategy;
const express = require('express');
const app = express()
const pool = require('./db')
const constants = require('./constants')
const expressSession = require('express-session')


app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'cat'
}));
app.use(express.json())
// passport.serializeUser(function (user, done) {
//     console.log('userrrrrrrrrrrr', user)
//     done(null, user);
// });

// passport.deserializeUser(function (user, done) {
//     console.log('userrrrrrrrrrrr1111111111111', user)
//     done(null, user);
// });
app.use(express.urlencoded())

let cert1 = require('fs').readFileSync(__dirname + '/testAppFiles/AWS_SSO_for_Custom SAML 2.0 application_certificate2.pem', 'utf8')

var samlStrategy = new SamlStrategy({
    //callbackUrl: 'http://43.204.223.103:3001/api/login/callback',
    callbackUrl: 'https://43.204.237.53/ssoapi/login/callback',
    //entryPoint:'https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MTAyODgxNzE3MjkyX2lucy02ZjZiMzYwMmJjYWM3NTFl',
    entryPoint: "https://d-9f672cf8b6.awsapps.com/start#/",
    issuer: "https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MzczNzYxNTEwMDExX2lucy1hYWYyNjdmZmU4NjhjNzNk",
    logoutUrl: "https://portal.sso.ap-south-1.amazonaws.com/saml/logout/MzczNzYxNTEwMDExX2lucy1hYWYyNjdmZmU4NjhjNzNk",
    cert: cert1
}, function (profile, done) {
    console.log('Profile: %j', profile);
    return done(null, profile);
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(samlStrategy);

app.get('/login/fail', (req, res) => res.send(`<p> test </p>`))

app.get('/', (req, res) => {
    res.send(`<p> AttemptedUrl </p>`)
})

app.get('/.well-known/pki-validation/:Id', (req, res) => res.sendFile(__dirname + '/' + req.params.Id))


app.get('/ssoapi',
    passport.authenticate('saml', { failureRedirect: '/login/fail' }),
    function (req, res) {
        try {
            console.log("Api SSo was called")
            res.type('application/xml');

            samlStrategy.generateServiceProviderMetadata(cert1)
            //require('fs').writeFileSync(__dirname + '/dummy.txt', 'pi SSo was called"')
            res.redirect('/');
        } catch (error) {
            res.redirect('/login/fail');

        }

    }
);

app.post('/ssoapi/login/callback',
    passport.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }),
    function (req, res) {
        try {
            console.log('reqqqqqqqqq', req.headers)
            console.log('reqqqqqqqqq bodyyyyyyyyyyyyyy', req.body)

            //require('fs').writeFileSync(__dirname + '/dummy1.txt', 'pi SSo  Post was called"')

            res.send(JSON.stringify(req.body));
        } catch (error) {
            res.redirect('/login/fail');

        }

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