import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState, useRef } from 'react';
import { Link } from "react-router-dom";
import Axios from "axios";
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import '../styles/FileUpload.css';


function FileUpload() {

  const [filesArr, setFilesArr] = useState([]);
  const fileSelect = useRef(null);

  const [fileList, setFileList] = useState([]);
  


 
  const showFile = () => {
    Axios.get("http://localhost:3001/readfiles").then((response) => {
      console.log(response.data);
      Object.keys(response.data).forEach(key => {

        Object.keys(response.data[key].fileCollection).forEach(fileKey => {

           setFileList((arr) => [ ...arr, { file: response.data[key].fileCollection[fileKey]}]);

         });
        
       }
     ) 
      
    });
  };

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
      console.log(res.data);
    });
  };

//form from Bootstrap
// https://react-bootstrap.github.io/forms/form-control/
    return (
      <>
      <div id='uploadForm'>
        <Form.Group controlId="formFileMultiple" className="mb-3">
          <Form.Label>Select files to be uploaded </Form.Label>
          <Form.Control type="file" multiple  ref={fileSelect} onChange={saveFile}/>
        </Form.Group>
        <Button type='submit' onClick={uploadFile} id='button'>
                Save
        </Button>

        <Button type='submit' onClick={showFile} id='button'>Show</Button>
        </div>

        <div id='fileList'>
        {fileList.map((val, key) => {
          return (
          <ListGroup>
            <ListGroupItem>
              <Link to={"/file/" + val.file.filename} key={key}>
                    {val.file.originalname}
              </Link>
          </ListGroupItem>
          </ListGroup>
          )
        })}
        </div>
      </>
    );
  }
  
  export default FileUpload;