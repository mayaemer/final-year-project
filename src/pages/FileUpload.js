import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import "../styles/FileUpload.css";

function FileUpload() {

  const [filesArr, setFilesArr] = useState([]);
  const fileSelect = useRef(null);
  const [fileList, setFileList] = useState([]);

  // return names of saved files
  const showFile = () => {
    Axios.get("http://localhost:3001/readfiles").then((response) => {
      console.log(response.data);
      Object.keys(response.data).forEach((key) => {
        setFileList((arr) => [ ...arr, { file: response.data[key]}]);
      });
    });
  };

  // save files selected for upload to array
  const saveFile = (e) => {
    Object.keys(e.target.files).forEach((key) => {
      setFilesArr((arr) => [...arr, { file: e.target.files[key] }]);
    });
  };

  // upload selected files to database
  const uploadFile = async (e) => {
    const formData = new FormData();

    console.log(filesArr.length);
    if (filesArr.length == 0) {
      alert("No files selected. Please select a file to upload.");
    } else {
      filesArr.forEach((file) => {
        formData.append("files", file.file);
        console.log(file.file);
      });

      fileSelect.current.value = null;

      Axios.post("http://localhost:3001/upload", formData, {}).then((res) => {
        try {
          const response = res.data;
          alert('Successfully uploaded');
        } catch (e) {
          console.log(e);
        }
      });
    }
  };

  //Form from bootstrap
  // https://react-bootstrap.github.io/forms/form-control/
  return (
    <>
      <div id="uploadForm">
        <Form.Group controlId="formFileMultiple" data-testid='fileUpload' className="mb-3">
          <Form.Label>Select files to be uploaded </Form.Label>
          <Form.Control
            type="file"
            multiple
            ref={fileSelect}
            onChange={saveFile}
          />
        </Form.Group>
        <Button type="submit" onClick={uploadFile} id="button">
          Save
        </Button>

        <Button type="submit" onClick={showFile} id="button">
          Show
        </Button>
      </div>

      <div id="fileList">
        {fileList.map((val, key) => {
          return (
            <ListGroup>
              <ListGroupItem>
                <Link to={"/file/" + val.file.filename} key={key}>
                  {val.file.originalname}
                </Link>
              </ListGroupItem>
            </ListGroup>
          );
        })}
      </div>
    </>
  );
}

export default FileUpload;
