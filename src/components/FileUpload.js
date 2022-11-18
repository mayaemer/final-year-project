import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import Axios from "axios";


function FileUpload() {


 
  const [filesArr, setFilesArr] = useState([]);

  const saveFile = (e) => {
    Object.keys(e.target.files).forEach(key => {

      setFilesArr((arr) => [ ...arr, { file: e.target.files[key]}]);

    }
    ) 
  }

  const uploadFile = async (e) => {
    const formData = new FormData();

    filesArr.forEach(file => {
      formData.append('files', file.file);
      console.log(file.file);
    })

    for (var pair of formData.entries()) {
      console.log(pair[0]+ ', ' + pair[1]); 
  }
    Axios.post("http://localhost:3001/upload", formData, {
    }).then(res => {
      console.log(res.data);
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