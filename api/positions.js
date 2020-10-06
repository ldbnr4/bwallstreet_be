// const MongoClient = require("mongodb").MongoClient;
// var db;

// const client = new MongoClient(process.env.mongodb_url, {
//   useNewUrlParser: true
// });

function newFun(callback) {
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

module.exports = (req, res) => {
  const MongoClient = require("mongodb").MongoClient;
  var db;

  const client = new MongoClient(process.env.mongodb_url, {
    useNewUrlParser: true
  });

  // res.send("surrender");
  // Connect to database and insert default users into users collection
  client.connect((err) => {
    // var dbUsers = [];
    console.log("Connected successfully to database");

    db = client.db(process.env.db_name);
    if (req.method === "PUT") {
      newFun();
    } else {
      db.collection("positions")
        .find({})
        .toArray(function (err, result) {
          if (err) throw err;
          // console.log(result);
          res.status(200);
          res.setHeader("Content-Type", "application/json");
          res.send(JSON.stringify(result));
        });
    }
  });
};
