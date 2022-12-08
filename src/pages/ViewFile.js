import { useParams } from "react-router";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

// page to view selected file
function ViewFile() {

  // retrieves the selected file from the url parameter
  const { selectedFile } = useParams();

  // retrieves the image from /server/uploads directory
  const docs = [
    { uri: require("/server/uploads/" + selectedFile)}
  ];

  // renders doc viewer with selected file
  return (
    <div className="App">
    <DocViewer documents={docs}  pluginRenderers={DocViewerRenderers}/>
    </div>
  )
}

export default ViewFile;

