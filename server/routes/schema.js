const express = require("express");
const router = express.Router();
const http = require("http");

// Load User model
const Schema = require("../models/SchemaModel");

require("dotenv").config();
const LOCAL_IP = process.env.LOCAL_IP;
const MAIN_BACKEND_PORT = process.env.MAIN_BACKEND_PORT;
const API_IP = process.env.API_IP;

// @route GET api/schema/getAll
// @desc Get all the schema(name , desc, did) from the schema db
// @access Public
router.get("/getAll", (req, res) => {
  Schema.find()
    .then((allSchemas) => {
      for (ind = 0; ind < allSchemas.length; ind++) {
        let newSchema = {
          name: allSchemas[ind].name,
          description: allSchemas[ind].description,
          did: allSchemas[ind].did,
        };
        allSchemas[ind] = newSchema;
      }
      res.status(200).json({ schemas: allSchemas });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: err });
    });
});

// @route POST api/schema/create
// @desc Store the schema in blockchain and database.
// @access Public
router.post("/create", (req, res) => {
  const schemaData = req.body;
  console.log(schemaData);

  //making api call to main server and get schema DID.
  const reqObject = {
    issuerDID: schemaData.did,
    name: schemaData.name,
    description: schemaData.description,
    properties: schemaData.properties,
  };
  const data = JSON.stringify(reqObject);

  const options = {
    hostname: API_IP,
    port: MAIN_BACKEND_PORT,
    path: "/createSchema",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const request = http
    .request(options, (response) => {
      console.log(`statusCode: ${response.statusCode}`);

      response.on("data", (d) => {
        const schemaDid = JSON.parse(d).did;
        Schema.findOne({ did: schemaDid }).then((schema) => {
          if (schema) {
            return res
              .status(400)
              .json({ error: "The same schema alredy exists" });
          } else {
            const newSchema = new Schema({
              name: schemaData.name,
              description: schemaData.description,
              did: schemaDid,
            });
            console.log(newSchema);

            newSchema
              .save()
              .then((data) => {
                console.log(data);
                res.status(200).json(data);
              })
              .catch((err) => {
                console.log(err);
                res.status(400).json({ error: "Error in updating Schema DB" });
              });
          }
        });
      });
    })
    .on("error", (error) => {
      console.error(error);
    });
  request.write(data);
  request.end();
});

module.exports = router;
