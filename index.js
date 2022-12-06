const passport = require('passport')
const SamlStrategy = require('passport-saml').Strategy;
const express = require('express');
const app = express()
const pool = require('./db')
const constants = require('./constants')
const expressSession = require('express-session')
const xml2js = require('xml2js');
const flash = require('connect-flash')
const crypto = require('crypto-js')
const logger = require('./logger')

app.use(express.json())

app.use(express.urlencoded({ extended: false }))
app.use(expressSession({
    resave: false,
    saveUninitialized: true,
    secret: 'cat'
}));

passport.serializeUser(function (user, done) {
    logger.info('userrrrrrrrrrrr ' + JSON.stringify(user))
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    logger.info('userrrrrrrrrrrr1111111111111 ' + JSON.stringify(user))
    done(null, user);
});



let cert = require('fs').readFileSync(__dirname + '/AWS_SSO_for_Custom SAML 2.0 application_certificate.pem', 'utf8')
var samlStrategy = new SamlStrategy({
    callbackUrl: constants.SSO_CALLBACK_URL,
    entryPoint: constants.SSO_ENTRY_POINT_URL,
    issuer: constants.SSO_ISSUER_URL,
    logoutUrl: constants.SSO_LOGOUT_URL,
    cert: cert
}, function (profile, done) {
    //logger.info('Profile: %j', profile);
    return done(null, profile);
});

passport.use(samlStrategy);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

app.get('/ssoapi/login/fail', (req, res) => res.send(`${req.flash("error")} `))

app.get('/ssoapi', (req, res) => {
    logger.info("Logger Test")
    res.send(`${req.flash("info")} <p> AttemptedUrl </p>`)
})



app.get('/ssoapi/',
    passport.authenticate('saml', { failureRedirect: '/ssoapi/login/fail' }),
    (req, res) => {
        res.send('Hello World!');
    }
);

//app.get('/tempURL', (req, res) => res.send(`<p> ${req.query.userId}<p>`))

app.post('/ssoapi/login/callback',
    passport.authenticate('saml', { failureRedirect: '/ssoapi/login/fail', failureFlash: true }),
    async (req, res) => {
        try {
            let xmlData = Buffer.from(req.body.SAMLResponse, 'base64').toString()
            let email = await parseXml(xmlData)
            logger.info("Emailllllllllllll " + email)

            //let email = 'Sachin.pawale@neweltechnologies.com'
            let userData = await checkUserExists(email)
            if (userData.length) {
                logger.info('userData' + JSON.stringify(userData))
                return res.redirect(`https://csrguat.lightstorm.in/ltc/asset/?userid=${encryptionAES(userData[0].Id.toString())}`)
            }
            return res.redirect(constants.SSO_ENTRY_POINT_URL);

        } catch (error) {
            logger.error('error' + error.toString())
            // req.flash('error', 'Access Denied')
            // res.redirect('/ssoapi/login/fail');
            return res.redirect(constants.SSO_ENTRY_POINT_URL);

        }


    }
);

app.get('/getLogByDate/:logDate', (req, res) => {
    try {
        logger.info("Fetching File for date: " + req.params.logDate)
        if (require('fs').existsSync(constants.LOG_CONFIG.LOG_FOLDER + req.params.logDate + '.log')) {
            res.download((constants.LOG_CONFIG.LOG_FOLDER + req.params.logDate + '.log'))

        } else {
            logger.error("Log File does not exist for the  date " + req.params.logDate)
            res.send({ msg: `Log File does not exist for the  date ${req.params.logDate}`, err: null })
        }

    } catch (error) {
        logger.error("Something went wrong Error for " + req.params.logDate + ' ' + error.toString())

        //logger.info("Unable to fetch Log file for  Date:" + req.params.logDate + "Error Encountered ")
        res.send({ msg: "Something went wrong", err: error })
    }
})

app.listen(constants.PORT_NO, () => logger.info("Server is listening on port " + constants.PORT_NO))


async function parseXml(xmlData) {
    return new Promise((resolve, reject) => {
        let parser = new xml2js.Parser();
        parser.parseString(xmlData, function (err, result) {
            //Extract the value from the data element
            //extractedData = result['config']['data'];
            if (err) {
                reject(err)
            } else {
                resolve(result["saml2p:Response"]["saml2:Assertion"][0]["saml2:Subject"][0]["saml2:NameID"][0]["_"]);

            }
            //logger.info(result);
        })
    })
}

async function checkUserExists(email) {
    return new Promise((resolve, reject) => {
        pool.query(`select Id from usermst where EmailId = '${email}'  and IsActive = 1`, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

function encryptionAES(code) {
    let ciphertext = crypto.AES.encrypt(code, constants.URI_ENCRYPTION_SECRET);
    console.log(' ciphertext.toString()', ciphertext.toString())
    //logger.info("Encrypted User ID", ciphertext.toString())
    return ciphertext.toString();

}