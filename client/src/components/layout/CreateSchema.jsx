import React, { useEffect, useState } from "react";
import {
  Alert,
  Row,
  Col,
  FormControl,
  Button,
  Form,
  Card,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";

require("dotenv").config();
const LOCAL_IP = process.env.REACT_APP_LOCAL_IP;
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT;

const CreateSchema = () => {
  const email = useSelector((state) => state.auth.user.email);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [form, setForm] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    axios
      .get("http://" + LOCAL_IP + ":" + BACKEND_PORT + "/api/users/info", {
        params: {
          email: email,
        },
      })
      .then((res) => {
        const data = res.data;
        setUser(data);
      });
  }, []);

  const addProperty = (e) => {
    e.preventDefault();
    const newValue = {
      key: "",
      propType: "",
      propFormat: "",
    };
    setForm((prev) => {
      return [...prev, newValue];
    });
    console.log(form);
  };

  const onPropertyChange = (e, index) => {
    e.preventDefault();
    const propertyName = e.target.name;
    const propertyValue = e.target.value;
    setForm((prev) => {
      return prev.map((value, ind) => {
        if (ind !== index) {
          return value;
        }
        return {
          ...value,
          [propertyName]: propertyValue,
        };
      });
    });
  };

  const removeProperty = (e, index) => {
    e.preventDefault();
    setForm((prev) => prev.filter((item) => item !== prev[index]));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    let schemaData = {
      name: name,
      did: user.did,
      description: description,
      properties: form,
    };
    axios
      .post(
        "http://" + LOCAL_IP + ":" + BACKEND_PORT + "/api/schema/create",
        schemaData
      )
      .then((res) => {
        const data = res.data;
        setName("");
        setDescription("");
        setForm([]);
        console.log(data);
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Container className="d-flex flex-column align-items-center">
        {user.did !== "" ? (
          <Card className="shadow w-75 mt-5 mb-5">
            <Card.Header className="pl-5 pt-3 pb-2 d-flex flex-column align-items-center bg-dark text-white">
              <h2>
                <strong>Create Schema</strong>
              </h2>
            </Card.Header>
            <Card.Body className="px-5">
              <Form onSubmit={onSubmit}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm="2">
                    Name
                  </Form.Label>
                  <Col sm="10">
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-4">
                  <Form.Label column sm="2">
                    Description
                  </Form.Label>
                  <Col sm="10">
                    <FormControl
                      as="textarea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Col>
                </Form.Group>
                {form.map((value, index) => {
                  return (
                    <>
                      <hr />
                      <Form.Group key={index} as={Row} className="mb-3">
                        <Form.Label column sm="2">
                          Key
                        </Form.Label>
                        <Col sm="10">
                          <Form.Control
                            type="text"
                            value={value.key}
                            name="key"
                            onChange={(e) => onPropertyChange(e, index)}
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group key={index} as={Row} className="mb-3">
                        <Form.Label column sm="2">
                          Type
                        </Form.Label>
                        <Col sm="10">
                          <Form.Control
                            type="text"
                            value={value.propType}
                            name="propType"
                            onChange={(e) => onPropertyChange(e, index)}
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group key={index} as={Row} className="mb-3">
                        <Form.Label column sm="2">
                          Format
                        </Form.Label>
                        <Col sm="10">
                          <Form.Control
                            type="text"
                            value={value.propFormat}
                            name="propFormat"
                            onChange={(e) => onPropertyChange(e, index)}
                          />
                        </Col>
                      </Form.Group>
                      <div className="d-flex flex-column align-items-end mt-3">
                        <Button
                          variant="danger"
                          type="submit"
                          onClick={(e) => removeProperty(e, index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </>
                  );
                })}
                <hr />
                <div className="d-flex flex-column align-items-end mt-3">
                  <Button variant="success" type="submit" onClick={addProperty}>
                    Add Property
                  </Button>
                </div>
                <div className="d-flex flex-column align-items-center mt-3">
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        ) : (
          <Alert variant="danger" className="mt-3">
            You need to Create a DID before you can create a schema
          </Alert>
        )}
      </Container>
    </>
  );
};

export default CreateSchema;
