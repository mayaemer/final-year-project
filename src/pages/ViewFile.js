import { useParams } from "react-router";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";


function ViewFile() {
  const { selectedFile } = useParams();

  const docs = [
    { uri: require("/server/uploads/" + selectedFile)}
  ];

  return (
    <div className="App">
    <DocViewer documents={docs}  pluginRenderers={DocViewerRenderers}/>
    </div>
  )
}

export default ViewFile;
