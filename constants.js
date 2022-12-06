module.exports = {
    PORT_NO: 3001,
    DB_USER: 'ltcportal',
    DB_PASS: 'Itcportal@2021',
    DB_HOST: '10.1.2.134',
    DATABASE: 'ltcportal',
    DB_CONNECTION_LIMIT: 10,
    SSO_ENTRY_POINT_URL: 'https://lightstormtelecom.awsapps.com/start',
    SSO_LOGOUT_URL: 'https://portal.sso.ap-south-1.amazonaws.com/saml/logout/MTAyODgxNzE3MjkyX2lucy05YTIwMmFkYmNlMTU4YjQz',
    SSO_ISSUER_URL: 'https://portal.sso.ap-south-1.amazonaws.com/saml/assertion/MTAyODgxNzE3MjkyX2lucy05YTIwMmFkYmNlMTU4YjQz',
    SSO_CALLBACK_URL: 'https://csrguat.lightstorm.in/ssoapi/login/callback',
    URI_ENCRYPTION_SECRET: 'DSDSADSA32323244',
    LOG_CONFIG: {
        LOG_FOLDER: __dirname + '/logs/',
        LOG_FILE: "%DATE%.log",
        LOG_FILE_ERROR: "ErrorLog-%DATE%.log"
    }
}