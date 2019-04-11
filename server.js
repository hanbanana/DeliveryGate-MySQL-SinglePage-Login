var express = require("express");
var bodyParser = require("body-parser");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;
var staticIP = "192.168.10.40";

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "hrx_delivery_db"
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

// Use Handlebars to render the main index.html page with the todos in it.
app.get("/", function (req, res) {
  connection.query("SELECT * FROM deliveryOrder;", function (err, data) {
    if (err) {
      return res.status(500).end();
    }

    res.render("index", { deliveryOrder: data });
  });
});

// app.get("/", function (req, res) {
//   connection.query("SELECT * FROM deliveryOrder;", function (err, data) {
//     if (err) {
//       return res.status(500).end();
//     }

//     res.render("wrongPage", { deliveryOrder: data });
//   });
// });

// app.get("/gate/DeliveryOrder", function (req, res) {
//   connection.query("SELECT * FROM deliveryOrder;", function (err, data) {
//     if (err) {
//       return res.status(500).end();
//     }

//     res.render("index", { deliveryOrder: data });
//   });
// });

app.get("/create", function (req, res) {
  connection.query("SELECT * FROM deliveryOrder;", function (err, data) {
    if (err) {
      return res.status(500).end();
    }

    res.render("create", { deliveryOrder: data });
  });
});

app.get("/order/:id", function (req, res) {
  connection.query("SELECT * FROM deliveryOrder where id = ?", [req.params.id], function (err, data) {
    if (err) {
      return res.status(500).end();
    }

    console.log(data);
    res.render("edit", data[0]);
  });
});

app.get("/customer", function (req, res) {
  connection.query("SELECT * FROM deliveryOrder WHERE Close_ = 'No';", function (err, data) {
    if (err) {
      return res.status(500).end();
    }

    res.render("customer", { deliveryOrder: data });
  });
});

app.get("/contact", function (req, res) {
  connection.query("SELECT * FROM deliveryOrder;", function (err, data) {
    if (err) {
      return res.status(500).end();
    }

    res.render("contact", { deliveryOrder: data });
  });
});

// Create a new todo
app.post("/todos", function (req, res) {
  connection.query("INSERT INTO deliveryOrder (BL, Terminal_Name, Container_No, Vassel_No, ETA, Weight, Seal_No, Delivery_Location, Status_, Return_, Close_) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [req.body.BL, req.body.Terminal_Name, req.body.Container_No, req.body.Vassel_No, req.body.ETA, req.body.Weight, req.body.Seal_No, req.body.Delivery_Location, req.body.Status_, req.body.Return_, req.body.Close_], function (err, result) {
      if (err) {
        return res.status(500).end();
      }

      // Send back the ID of the new todo
      res.json({ id: result.insertId });
      console.log({ id: result.insertId });
    });
});

// Retrieve all todos
app.get("/todos", function (req, res) {
  connection.query("SELECT * FROM deliveryOrder;", function (err, data) {
    if (err) {
      return res.status(500).end();
    }

    res.json(data);
  });
});

// Update a todo
app.put("/todos/:id", function (req, res) {
  connection.query("UPDATE deliveryOrder SET BL = ?, Terminal_Name = ?, Container_No = ?, Vassel_No = ?, ETA = ?, Weight = ?, Seal_No = ?, Delivery_Location = ?, Status_ = ?, Return_ = ?, Close_ = ? WHERE id = ?",
  [req.body.BL, req.body.Terminal_Name, req.body.Container_No, req.body.Vassel_No, req.body.ETA, req.body.Weight, req.body.Seal_No, req.body.Delivery_Location, req.body.Status_, req.body.Return_, req.body.Close_, req.params.id],
    function (err, result) {
      if (err) {
        // If an error occurred, send a generic server failure
        return res.status(500).end();
      }
      else if (result.changedRows === 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      }
      res.status(200).end();

    });
});

// Delete a todo
app.delete("/todos/:id", function (req, res) {
  connection.query("DELETE FROM deliveryOrder WHERE id = ?", [req.params.id], function (err, result) {
    if (err) {
      // If an error occurred, send a generic server failure
      return res.status(500).end();
    }
    else if (result.affectedRows === 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return res.status(404).end();
    }
    res.status(200).end();

  });
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, staticIP, function () {
  // Log (server-side) when our server has started
  console.log("Server listening on: " + staticIP + ":" + PORT);
});

// app.listen(process.env.PORT);