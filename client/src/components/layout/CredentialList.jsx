import React, { useState, useEffect } from "react";
import { QRCode } from "react-qr-svg";
import { Modal, Card, Button, Container } from "react-bootstrap";
import axios from "axios";
import { useSelector } from "react-redux";

require("dotenv").config();
const LOCAL_IP = process.env.REACT_APP_LOCAL_IP;
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT;

const CredentialList = () => {
  const localUserData = useSelector((state) => state.auth.user);
  const [userData, setUserData] = useState({});
  const [credList, setCredList] = useState([]);
  const [show, setShow] = useState(false);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    axios
      .get("http://" + LOCAL_IP + ":" + BACKEND_PORT + "/api/users/info", {
        params: {
          email: localUserData.email,
        },
      })
      .then((response) => {
        setUserData(response.data);
        axios
          .get("http://" + LOCAL_IP + ":" + BACKEND_PORT + "/api/schema/getAll")
          .then((res) => {
            const data = res.data;
            setCredList(data.schemas);
          })
          .catch((error) => console.log(error));
      });
  }, []);

  const onGenerateQr = (e, index) => {
    setShow(true);
    const link =
      "http://" + LOCAL_IP + ":" + BACKEND_PORT + "/api/credential/create";
    console.log(link);
    setQrValue(
      JSON.stringify({
        url: link,
        schemaDid: credList[index].did,
        userId: userData.patientId,
      })
    );
  };

  return (
    <>
      <Modal
        className="text-center"
        show={show}
        onHide={() => setShow(false)}
        centered
      >
        <Modal.Header className="text-center" closeButton>
          <Modal.Title>QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QRCode
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="Q"
            style={{ width: 256 }}
            value={qrValue}
            className="my-2"
          />
        </Modal.Body>
      </Modal>
      <Container className="mt-3 w-50">
        <h2 className="text-center my-5">Available Credentials</h2>
        {credList.map((value, ind) => {
          return (
            <Card className="m-2">
              <Card.Header as="h5" className="text-center">
                {value.name}
              </Card.Header>
              <Card.Body>
                <Card.Text>{value.description}</Card.Text>
                {!localUserData.isAdmin && (
                  <div className="text-end">
                    <Button
                      variant="primary"
                      onClick={(e) => onGenerateQr(e, ind)}
                    >
                      Generate QR
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          );
        })}
      </Container>
    </>
  );
};

export default CredentialList;
