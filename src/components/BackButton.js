import Fab from "@mui/material/Fab";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router";

function BackButton(props) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/" + props.destination);
  };

  return (
    <div>
      <Fab aria-label="back" onClick={handleBack}>
        <ArrowBackIosIcon />
      </Fab>
    </div>
  );
}

export default BackButton;
