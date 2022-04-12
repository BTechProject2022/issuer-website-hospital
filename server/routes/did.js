const express = require("express");
const http = require("http");
const axios = require("axios");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

// Load input validation
//const validateRegisterInput = require("../validation/register");
//const validateLoginInput = require("../validation/login");

require("dotenv").config();
const LOCAL_IP = process.env.LOCAL_IP;
const MAIN_BACKEND_PORT = process.env.MAIN_BACKEND_PORT;
const API_IP = process.env.API_IP;

// Load User model
const User = require("../models/UserModel");
const Schema = require("../models/SchemaModel");

// @route POST api/did/create
// @desc Store address and public key for user and create DID.
// @access Public
router.post("/create", (req, res) => {
  console.log("create request");
  const userData = {
    email: req.body.email,
    address: req.body.address,
    publicKey: req.body.publicKey,
    privateKey: req.body.privateKey,
    orgName: req.body.orgName,
  };

  //getting did from main server.
  const reqObject = {
    address: userData.address,
    publicKey: userData.publicKey,
    name: userData.orgName,
  };
  const data = JSON.stringify(reqObject);

  console.log(LOCAL_IP, MAIN_BACKEND_PORT);

  const options = {
    hostname: API_IP,
    port: MAIN_BACKEND_PORT,
    path: "/createDID",
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
        const { did } = JSON.parse(d);
        User.findOne({ email: userData.email }).then((user) => {
          user.orgName = userData.orgName;
          user.address = userData.address;
          user.publicKey = userData.publicKey;
          user.privateKey = userData.privateKey;
          user.did = did;
          user
            .save()
            .then((user) => {
              const requestObject = {
                issuerDID: did,
                name: "Report",
                description:
                  "A report of the patient's condition and the doctor's opinion.",
                properties: [
                  {
                    key: "emailAddress",
                    propType: "string",
                    propFormat: "email",
                  },
                  {
                    key: "name",
                    propType: "string",
                    propFormat: "text",
                  },
                  {
                    key: "hospitalName",
                    propType: "string",
                    propFormat: "text",
                  },
                  {
                    key: "birthDate",
                    propType: "date",
                    propFormat: "text",
                  },
                  {
                    key: "patientID",
                    propType: "string",
                    propFormat: "text",
                  },
                  {
                    key: "address",
                    propType: "string",
                    propFormat: "text",
                  },
                  {
                    key: "doctorsName",
                    propType: "string",
                    propFormat: "text",
                  },
                  {
                    key: "phoneNumber",
                    propType: "string",
                    propFormat: "text",
                  },
                  {
                    key: "age",
                    propType: "number",
                    propFormat: "text",
                  },
                  {
                    key: "condition",
                    propType: "string",
                    propFormat: "text",
                  }
                ],
              };
              const stringData = JSON.stringify(requestObject);
              console.log(stringData);

              const opts = {
                hostname: API_IP,
                port: MAIN_BACKEND_PORT,
                path: "/createSchema",
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Content-Length": stringData.length,
                },
              };

              const httpRequest = http
                .request(opts, (resObject) => {
                  console.log(
                    `statusCode at httpRequest: ${resObject.statusCode}`
                  );

                  resObject.on("data", (value) => {
                    const schemaDid = JSON.parse(value).did;
                    console.log("schema Did: ", schemaDid);
                    Schema.findOne({ did: schemaDid }).then((schema) => {
                      if (schema) {
                        return res
                          .status(400)
                          .json({ error: "The same schema alredy exists" });
                      } else {
                        const newSchema = new Schema({
                          name: "Report",
                          description:
                            "A report of the patient's condition and the doctor's opinion.",
                          did: schemaDid,
                        });
                        console.log(newSchema);

                        newSchema
                          .save()
                          .then((data) => {
                            console.log(data);
                            console.log("report Schema has been created");
                            res.status(200).json(user);
                          })
                          .catch((err) => {
                            console.log(err);
                            res
                              .status(400)
                              .json({ error: "Error in updating Schema DB" });
                          });
                      }
                    });
                  });
                })
                .on("error", (error) => {
                  console.error(error);
                });
              httpRequest.write(stringData);
              httpRequest.end();
            })
            .catch((err) => {
              res.status(400).json({ error: "couldn't update user Details" });
              console.log(err);
            });
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
