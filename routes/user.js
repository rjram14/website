var bcrypt = require("bcrypt");
var passport = require("passport");
var jwt = require("jsonwebtoken");
const keys = require("../config/jwtConfig");
var mailHandler = require("../config/mailTransport.js");
var User = require("../models/index").Users;
var db = require("../models/index");

var db = require("../models/index.js");

const BCRYPT_SALT_ROUNDS = 12;

function generateHash(pass) {
  // let hashedPassword = await bcrypt.hash(pass, BCRYPT_SALT_ROUNDS)
  // return hashedPassword
  return bcrypt.hash(pass, BCRYPT_SALT_ROUNDS);
}
module.exports = function (app) {
  app.post("/register", (req, res) => {
    //  console.log("")
    // const reqQuery = req.
    const reqQuery = req.body;
    const username = reqQuery.username;
    const name = reqQuery.name;
    const gender = reqQuery.gender;
    const mobileNo = reqQuery.mobileNo;
    const password = reqQuery.password;
    try {
      User.findOne({
        where: {
          username: username,
        },
      }).then((user) => {
        if (user != null) {
          console.log("Username already taken");
          res.json({ status: false, message: "Username already exists" });
        } else {
          bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then((hashedPassword) => {
            User.create({
              name,
              mobileNo,
              gender,
              username,
              password: hashedPassword,
            }).then((user) => {
              const payload = {
                u_id: user.id,
                name: user.name,
                username: user.username,
                mobileNo: user.mobileNo,
                accessType: user.accessType,
                // expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
              };

              /** assigns payload to req.user */
              req.login(payload, { session: false }, (error) => {
                if (error) {
                  // res.status(400).send({ error });
                  res.json({ status: false, message: error });
                  return;
                }
                const token = jwt.sign(JSON.stringify(payload), keys.secret);
                res.json({ status: true, message: { token, user: payload } });
                // console.log("user created");
                // res.json({ status: true, message: "User created", data: { user_id: user.id, username: user.username } })
              });
            });
          });
        }
      });
    } catch (err) {
      done(err);
    }
    // res.json({ reqQuery })
  });

  app.post("/login", (req, res, next) => {
    passport.authenticate("login", { session: false }, (error, user) => {
      if (error || !user) {
        // res.status(400).json({ error });
        res.json({ status: false, message: error });
        return;
      }

      /** This is what ends up in our JWT */
      const payload = {
        u_id: user.id,
        name: user.name,
        username: user.username,
        mobileNo: user.mobileNo,
        accessType: user.accessType,
        // expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
      };

      /** assigns payload to req.user */
      req.login(payload, { session: false }, (error) => {
        if (error) {
          // res.status(400).send({ error });
          res.json({ status: false, message: error });
          return;
        }

        /** generate a signed json web token and return it in the response */
        const token = jwt.sign(JSON.stringify(payload), keys.secret);

        /** assign our jwt to the cookie */
        // res.cookie('JWT', jwt, { httpOnly: true, secure: true });
        // res.status(200).send({ token });
        res.json({ status: true, message: { token, user: payload } });
      });
    })(req, res, next);
  });

  app.post("/send", (req, res) => {
    const output = `<p> You have a new contact request.</p>
                        <h3>Contact Details</h3>
                        <ul>
                            <li>Name: ${req.body.name}</li>
                            <li>Email: ${req.body.email}</li>
                            <li>Phone: ${req.body.phone}</li>
                        </ul>
                        <h3>Message</h3>
                        <p>${req.body.message}</p>`;
    const output_user = `<p> Dear ${req.body.name},<br><br><br>
                                 Your query has been received. Our team will respond the same within 3 buisness days.<br><br>
                                 <b>Regards<br>
                                 Team Fitmetoday<br><br><br></b>
                                <i>This is a system generated mail. Do not reply to this mail</i>
                            </p>`;
    let otherData = {
      receiverMail: "fitwithlalit@gmail.com",
      subject: "Contact from fitmetoday",
      text: "Contact form request",
    };
    let otherData_user = {
      receiverMail: req.body.email,
      subject: "Query successfully received, fitmetodaty",
      text: "Contact form request",
    };

    mailHandler.send(output, otherData, (error, info) => {
      if (error) {
        console.log(error);
        res.json({ status: false, msg: "Email has not been sent" });
        return;
      }
      console.log("Message sent: %s", info.messageId);

      res.json({ status: true, msg: "Email has been sent" });
    });

    mailHandler.send(output_user, otherData_user, (error, info) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log("Message sent: %s", info.messageId);
    });
  });

  app.post("/forgetPassword", (req, res) => {
    let otp = Math.floor(Math.random() * 999999);
    let username = req.body.username;
    db.Users.findOne({
      where: {
        username: username,
      },
    })
      .then(async (user) => {
        if (user) {
          user.otp = otp;
          await user.save();
          const output = `<p> Your otp to change password is:- ${otp}</p>`;
          let otherData = {
            receiverMail: user.username,
            subject: "Otp Details",
            text: "Otp request",
          };
          try {
            await mailHandler.send(output, otherData);
          } catch (e) {
            console.log("email sending failed to ", otherData);
          }
          return res.json({ status: true, data: "Otp send to your email" });
        } else {
          return res.json({ status: false, data: "User not found" });
        }
      })
      .catch((e) => {
        console.log(e);
        return res.json({ status: false, data: "Internal error" });
      });
  });

  app.post("/changePassword", (req, res) => {
    let reqQuery = req.body;
    let otp = reqQuery.otp;
    let password = reqQuery.password;
    let username = reqQuery.username;
    db.Users.findOne({
      where: {
        otp: otp,
        username: username,
      },
    })
      .then(async (user) => {
        if (user && user.length != 0) {
          let hashedPassword = await generateHash(password);
          console.log(hashedPassword);
          user.password = hashedPassword;
          user.otp = null;
          await user.save();
          return res.json({
            status: true,
            data: "Password changed successfully",
          });
        } else {
          return res.json({ status: false, data: "OTP did not match" });
        }
      })
      .catch((e) => {
        console.log(e);
        return res.json({ status: false, data: "Internal error" });
      });
  });

  app.get("/protected", (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      // console.log(err, user)
      // console.log("Info ", info.message)
      if (info !== undefined || !user) {
        res.status(200).json({ status: false, data: "Not Logged In" });
        return;
      }

      res.status(200).json({ status: true, data: user });
    })(req, res, next);
  });
  app.get("/loginFailed", (req, res) => {
    res.json({ status: false, data: [], msg: "Login Failed" });
  });

  app.get("/AllUsers_old", (req, res) => {
    let startDate = new Date();
    let endDate = new Date();
    endDate.setDate(startDate.getDate() - 7);
    let user = req.user;
    if (true) {
      db.Users.findAll({
        attributes: {
          exclude: ["password"],
          include: [
            [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "TotalUsers"],
          ],
        },
      })
        .then((user) => {
          if (user.TotalUsers !== 0) {
            res.json({ status: true, data: user });
          } else {
            res.json({ status: false, data: [] });
          }
        })
        .catch((e) => {
          console.log(e);
          res.json({ status: false, data: [] });
        });
    } else {
      res.json({ status: false, data: "User not logged in" });
    }
  });

  app.get("/getPaymentsHistory_old", (req, res) => {
    // let user = req.user;
    // if (user) {
    let startDate = new Date();
    let endDate = startDate.setDate(startDate.getDate() - 7);
    db.Users.findAll({
      include: [
        {
          model: db.Payment,
        },
      ],
      where: {
        createdAt: {
          [db.Sequelize.between]: [startDate, endDate],
        },
      },
    }).then((user) => {
      // console.log(user)
      const resObj = user.map((user) => {
        //tidy up the user data
        return Object.assign(
          {},
          {
            user_id: user.id,
            username: user.username,
            mobileNo: user.mobileNo,
            Payment: user.Payments,
          }
        );
      });

      res.json({ status: true, data: resObj });
    });
    // } else {
    //     res.json({ status: false, data: "User not logged in" })
    // }
  });

  app.get("/getPaymentDetails_old", (req, res) => {
    db.Payment.findAll({
      include: [{ model: db.Users }],
    }).then((data) => {
      // console.log(data)
      const resObj = data.map((records) => {
        return Object.assign(
          {},
          {
            userId: records.User.id,
            username: records.User.username,
            mobileNo: records.User.mobileNo,
            paymentId: records.id,
            orderId: records.order_id,
            amount: records.amount,
            product_info: records.product_info,
            transaction_id: records.transaction_id,
            transaction_status: records.transaction_status,
          }
        );
      });
      res.json(resObj);
    });
  });

  app.get(
    "/AllUsers",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/loginFailed",
    }),
    (req, res) => {
      if (req.user.accessType === 0) {
        db.Users.findAll({
          attributes: [
            "id",
            "name",
            "username",
            "gender",
            "mobileNo",
            "createdAt",
          ],
          where: {
            username: req.user.username,
          },
        })
          .then((user) => {
            res.json({ status: true, data: user });
            return;
          })
          .catch((e) => {
            console.log(e);
            res.json({ status: false, data: [] });
            return;
          });
      } else {
        db.Users.findAll({
          attributes: [
            "id",
            "name",
            "username",
            "gender",
            "mobileNo",
            "createdAt",
          ],
          order: [["createdAt", "DESC"]],
        })
          .then((user) => {
            console.log(user.length);
            res.json({ status: true, data: user });
          })
          .catch((e) => {
            console.log(e);
            res.json({ status: false, data: [] });
          });
      }
    }
  );

  app.get(
    "/getpayment",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/loginFailed",
    }),
    (req, res) => {
      if (req.user.accessType === 0) {
        db.Payment.findAll({
          include: [{ model: db.Users }],
          // attributes: ["id", "u_id", "order_id", "product_info", "amount", "transaction_id", "transaction_status", "createdAt"],
          where: {
            u_id: req.user.u_id,
          },
          order: [["createdAt", "DESC"]],
        })
          .then((user) => {
            console.log(user.length);
            const resObj = user.map((records) => {
              return Object.assign(
                {},
                {
                  id: records.id,
                  name: records.User.name,
                  order_id: records.order_id,
                  product_info: records.product_info,
                  amount: records.amount,
                  transaction_id: records.transaction_id,
                  transaction_status: records.transaction_status,
                  createdAt: records.createdAt,
                }
              );
            });
            console.log(resObj);
            res.json({ status: true, data: resObj });
            return;
          })
          .catch((e) => {
            console.log(e);
            res.json({ status: false, data: [] });
            return;
          });
      } else {
        db.Payment.findAll({
          include: [{ model: db.Users }],
          order: [["createdAt", "DESC"]],
          // attributes: ["id", "u_id", "order_id", "product_info", "amount", "transaction_id", "transaction_status", "createdAt"]
        })
          .then((user) => {
            console.log(user.length);
            const resObj = user.map((records) => {
              return Object.assign(
                {},
                {
                  id: records.id,
                  name: records.User.name,
                  order_id: records.order_id,
                  product_info: records.product_info,
                  amount: records.amount,
                  transaction_id: records.transaction_id,
                  transaction_status: records.transaction_status,
                  createdAt: records.createdAt,
                }
              );
            });
            res.json({ status: true, data: resObj });
          })
          .catch((e) => {
            console.log(e);
            res.json({ status: false, data: [] });
          });
      }
    }
  );
};

let startDate = new Date();
let endDate = new Date();
endDate.setDate(startDate.getDate() - 7);
console.log(startDate, endDate);
// db.Payment.findAll({
//     attributes: {
//         include: [
//             [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'TotalAmt']
//         ]
//     },
//     where: {
//         createdAt: {
//             [db.Sequelize.Op.between]: [endDate, startDate]
//         }
//     }
// }).then(data => {
//     console.log(data.length)

//     // console.log(data[0].Users.dataValues)
// }).catch(e => {
//     console.log(e)
// })
