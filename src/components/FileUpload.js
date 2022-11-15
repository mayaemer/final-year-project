import Form from 'react-bootstrap/Form';

//form from Bootstrap
// https://react-bootstrap.github.io/forms/form-control/
function FileUpload() {
    return (
      <>
        <Form.Group controlId="formFileMultiple" className="mb-3">
          <Form.Label>Select files to be uploaded </Form.Label>
          <Form.Control type="file" multiple />
        </Form.Group>
        <input type='submit'></input>

      </>
    );
  }
  
  export default FileUpload;