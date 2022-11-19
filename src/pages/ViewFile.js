import { useParams } from "react-router";
import React from "react";
import Axios from "axios";

function ViewFile() {
  const { selectedFile } = useParams();

  let test = 'test';

  const getSelectedFile = async (e) => {
    Axios.post("http://localhost:3001/readselectedfile", null, {
        params : {
            selectedFile,

        }
    }).then(res => {
      console.log(res.data);
    });
  };

  React.useEffect(() => {
    let unmounted = false;
    console.log("Running to fetch data");
    setTimeout(() => {
      console.log("Data loaded for page");

      if (!unmounted) {
        getSelectedFile();
      }
    }, 0);

    return () => {
      unmounted = true;
    };
  }, []);

  return <p>Hello</p>;
}

export default ViewFile;
