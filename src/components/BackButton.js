import Fab from "@mui/material/Fab";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router";
import { IconButton } from "@mui/material";

function BackButton(props) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/" + props.destination);
  };

  return (
    <div>
      <IconButton aria-label="back" id='return' onClick={handleBack}>
        <ArrowBackIosIcon />
      </IconButton>
    </div>
  );
}

export default BackButton;
