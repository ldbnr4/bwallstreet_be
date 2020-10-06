var express = require("express");
var router = express.Router();

const MongoClient = require("mongodb").MongoClient;
var db;

const client = new MongoClient(process.env.mongodb_url, {
  useNewUrlParser: true
});

function getData(res) {
  // Connect to database and insert default users into users collection
  client.connect((err) => {
    // var dbUsers = [];
    console.log("Connected successfully to database");

    db = client.db(process.env.db_name);
    db.collection("positions")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
      });
  });
}

function newFun(res) {
  var credentials = {
    username: process.env.username,
    password: process.env.password
  };
  var Robinhood = require("robinhood")(credentials, function () {
    Robinhood.nonzero_positions(function (err, response, body) {
      if (err) {
        console.error(err);
      } else {
        var buyPrice = parseFloat(body.results[0].average_buy_price);
        var qty = parseFloat(body.results[0].quantity);
        var amntPaid = buyPrice * qty;
        console.log(qty);
        console.log(amntPaid);
        console.log("Paid: " + amntPaid);
        client.connect((err) => {
          // var dbUsers = [];
          console.log("Connected successfully to database");

          db = client.db(process.env.db_name);

          db.collection("positions").insertOne({
            _id: body.results[0].account_number,
            positions: body.results
          });

          getData(res);

          // // Removes any existing entries in the users collection
          // db.collection("positions").deleteMany(
          //   { name: { $exists: true } },
          //   function (err, r) {
          //     for (var i = 0; i < users.length; i++) {
          //       // loop through all default users
          //       dbUsers.push({ name: users[i] });
          //     }
          //     // add them to users collection
          //     db.collection("positions").insertMany(dbUsers, function (
          //       err,
          //       r
          //     ) {
          //       console.log("Inserted initial users");
          //     });
          //   }
          // );
        });
      }
    });
  });
}

/* GET home page. */
router.get("/", function (req, res, next) {
  getData(res);
});

router.put("/", function (req, res, next) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  newFun(res);
});

module.exports = router;
