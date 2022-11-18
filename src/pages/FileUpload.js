import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState, useRef } from 'react';
import Axios from "axios";


function FileUpload() {

  const [filesArr, setFilesArr] = useState([]);
  const fileSelect = useRef(null);

 
  const showFile = () => {
    Axios.get("http://localhost:3001/readfiles").then((response) => {
      console.log(response.data);
    });
  };

  // const showFile = async (e) => {
  //   Axios.get("http://localhost:3001/read").then(res => {
  //   try{
  //     console.log(res)
  //   }
  //   catch(e){
  //     console.log(e);
  //   }
  //   }
  //   )
  // };

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

    fileSelect.current.value = null;

    Axios.post("http://localhost:3001/upload", formData, {
    }).then(res => {
      alert(res.data);
    });
  };

//form from Bootstrap
// https://react-bootstrap.github.io/forms/form-control/
    return (
      <>
        <Form.Group controlId="formFileMultiple" className="mb-3">
          <Form.Label>Select files to be uploaded </Form.Label>
          <Form.Control type="file" multiple  ref={fileSelect} onChange={saveFile}/>
        </Form.Group>
        <Button type='submit' onClick={uploadFile}>
                Save
        </Button>

        <Button type='submit' onClick={showFile}>Show</Button>

        

      </>
    );
  }
  
  export default FileUpload;