import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ApartmentIcon from "@mui/icons-material/Apartment";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import RedeemIcon from "@mui/icons-material/Redeem";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import MedicationIcon from "@mui/icons-material/Medication";
import MedicationLiquidIcon from "@mui/icons-material/MedicationLiquid";
import PersonIcon from "@mui/icons-material/Person";
// import ListSubheader from '@mui/material/ListSubheader';
import AssignmentIcon from "@mui/icons-material/Assignment";
import HomeIcon from "@mui/icons-material/Home";

const Sidebar = () => {
  //GET USER STATE
//   const { user } = useSelector((state) => state.auth);
  // const location = useLocation();

  return (
    <>
      <div>
        <React.Fragment>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <Link to="/">
              <ListItemText primary="Home" />
            </Link>
          </ListItemButton>
          <ListItemButton>
              <ListItemIcon>
                <VolunteerActivismIcon />
              </ListItemIcon>
              <Link to="/consumer">
                <ListItemText primary="Consumer" />
              </Link>
            </ListItemButton>
        </React.Fragment>
      </div>
    </>
  );
};

export default Sidebar;

export const secondaryListItems = (
  <React.Fragment>
    {/* <ListSubheader component="div" inset>
      Saved reports
    </ListSubheader> */}
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <Link to="/analytics">
        <ListItemText primary="Analytics" />
      </Link>
    </ListItemButton>
    {/* <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItemButton> */}
  </React.Fragment>
);
