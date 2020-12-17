var bcrypt = require("bcrypt");
var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var JWTstrategy = require("passport-jwt").Strategy;
var ExtractJWT = require("passport-jwt").ExtractJwt;

var jwtSecret = require("./jwtConfig");

var User = require("../models/index").Users
const BCRYPT_SALT_ROUNDS = 12;

passport.use("login",
    new localStrategy({
        usernameField: "username",
        password: "password",
        session: false
    }, (username, password, done) => {
        try {
            User.findOne({
                where: { username: username }
            }).then(user => {
                if (user == null) {
                    return done(null, false, { message: "bad username" })
                } else {
                    bcrypt.compare(password, user.password).then(response => {
                        if (response != true) {
                            console.log("passwords do not match")
                            return done(null, false, { message: "passwords do not match" })
                        }
                        console.log("user found and authenticated")
                        return done(null, user)
                    })
                }
            })
        } catch (err) {
            done(err)
        }
    }
    ))

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("JWT"),
    secretOrKey: jwtSecret.secret
};


passport.use("jwt",
    new JWTstrategy(opts, (jwt_payload, done) => {
        // console.log(jwt_payload)
        // console.log(opts)
        // done(jwt_payload, opts)
        try {
            User.findOne({
                where: {
                    username: jwt_payload.username
                }
            }).then(user => {
                if (user) {
                    console.log("user found")
                    return done(null, {
                        u_id: user.id,
                        name: user.name,
                        username: user.username,
                        mobileNo: user.mobileNo,
                        accessType: user.accessType
                    })
                } else {
                    console.log("user not found")
                    done(null, false)
                }
            })
        } catch (err) {
            done("err")
        }
    }))