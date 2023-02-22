import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";

function PaperLink(props) {

    return(
        <div>
          {groupList.map((groups) => (
            <Paper id='group'>
              <img id='groupImage' src="https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1356&h=668&fit=crop"/>
              <Link to={"/group/" + groups._id}>{groups.groupName}</Link>
            </Paper>
          ))}
        </div>
    )
}

export default PaperLink;