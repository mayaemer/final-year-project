import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";

function OptionPaper(props) {
  return (
    <Grid item lg={3} md={3} xs={6}>
      <Link to={props.link} id="paperLink">
        <Paper id="optionPaper">
          <img id="optionImage" src={props.image} />
          <p id="linkName">{props.name}</p>
        </Paper>
      </Link>
    </Grid>
  );
}

export default OptionPaper;
