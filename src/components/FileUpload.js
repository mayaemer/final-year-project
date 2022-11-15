import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import Axios from "axios";


function FileUpload() {

  const [file, setFile] = useState();
  const [fileName, setFileName] = useState('');

  const saveFile = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  }

  const uploadFile = async (e) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    Axios.post("http://localhost:3001/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(() => {
      console.log("success");
    });
  };
//form from Bootstrap
// https://react-bootstrap.github.io/forms/form-control/
    return (
      <>
        <Form.Group controlId="formFileMultiple" className="mb-3">
          <Form.Label>Select files to be uploaded </Form.Label>
          <Form.Control type="file" multiple onChange={saveFile}/>
        </Form.Group>
        <Button type='submit' onClick={uploadFile}>
                Save
        </Button>

        

      </>
    );
  }
  
  export default FileUpload;