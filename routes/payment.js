var crypto = require('crypto');
var Payment = require("../models/index").Payment
var Users = require("../models/index").Users
var passport = require("passport");


const salt_val = 'QtssVL9bZH';

var transactionId = 101

module.exports = function (app) {

    app.get("/loginFailedPayment", (req, res) => {
        console.log(req.body)
        let toSend = req.body
        toSend.txnid = ++transactionId;
        res.json({ status: false, data: { is_logged_in: false }, redirectData: toSend })
    })

    app.post('/plans_rest',
        //  passport.authenticate('jwt', {
        //     session: false,
        //     failureRedirect: '/loginFailedPayment'
        // }),
        (req, res, next) => {

            passport.authenticate('jwt', { session: false },
                (err, user, info) => {
                    if (info !== undefined || !user) {
                        console.log(req.body)
                        let toSend = req.body
                        toSend.txnid = ++transactionId;
                        res.json({ status: false, data: { is_logged_in: false }, redirectData: toSend })
                        return
                    }
                    console.log(req.body);
                    let toSend = req.body
                    toSend.is_logged_in = true;
                    toSend.txnid = ++transactionId;
                    toSend.fname = user.name;
                    toSend.email = user.username;
                    toSend.mobile = user.mobileNo;
                    res.json(toSend);
                })(req, res, next)
        });

    app.post('/payment_rest', passport.authenticate('jwt', {
        session: false,
        failureRedirect: '/loginFailedPayment'
    }), (req, res) => {

        var data = req.body
        var cryp = crypto.createHash('sha512');
        var text = data.key + '|' + data.txnid + '|' + data.amount + '|' + data.pinfo + '|' + data.fname + '|' + data.email + '|||||' + data.udf5 + '||||||' + salt_val;
        cryp.update(text);
        var hash = cryp.digest('hex');
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(JSON.stringify(hash));

    })

    app.post('/payment_response_rest', function (req, res) {
        var key = req.body.key;
        var salt = salt_val;
        var txnid = req.body.txnid;
        var amount = req.body.amount;
        var productinfo = req.body.productinfo;
        var firstname = req.body.firstname;
        var email = req.body.email;
        var udf5 = req.body.udf5;
        var mihpayid = req.body.mihpayid;
        var status = req.body.status;
        var resphash = req.body.hash;

        var keyString = key + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email + '|||||' + udf5 + '|||||';
        var keyArray = keyString.split('|');
        var reverseKeyArray = keyArray.reverse();
        var reverseKeyString = salt + '|' + status + '|' + reverseKeyArray.join('|');

        var cryp = crypto.createHash('sha512');
        cryp.update(reverseKeyString);
        var calchash = cryp.digest('hex');


        var msg = 'Payment failed for Hash not verified...';
        if (calchash == resphash)
            msg = 'Transaction Successful and Hash Verified...';

        Users.findOne({
            where: {
                username: email
            }
        }).then(UserData => {

            let PaymentData = {
                u_id: UserData.id,
                order_id: txnid,
                amount: amount,
                product_info: productinfo,
                transaction_id: mihpayid,
                hash: resphash,
                transaction_status: msg,
                message: msg
            }
            Payment.create(PaymentData).then(data => {
                console.log(data)
            }).catch(e => {
                console.log(e)
            })
        }).catch(e => {
            console.log(e)
        })
        // res.sendFile(__dirname + "../public/dashboard/transactions.html")
        // res.sendFile("/home/ehkhxw15yxy6/public_html/nodejs/public/dashboard/transactions.html")
        res.redirect("http://fitmetoday.com/dashboard/transactions.html?showPath=1")
        // res.render(__dirname + '/../public/response.html', {
        //     key: key, salt: salt, txnid: txnid, amount: amount, productinfo: productinfo,
        //     firstname: firstname, email: email, mihpayid: mihpayid, status: status, resphash: resphash, msg: msg, orderid: 300
        // });
    });



}