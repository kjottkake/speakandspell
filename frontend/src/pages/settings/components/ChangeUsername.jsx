import TextField from "@mui/material/TextField";
import { useState } from "react";
import {isValidUsername} from "../../../utils/isValid__.js";

export default function ChangeUsername ({classes, setValidUsername}) {
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <TextField
    autoFocus
    margin="dense"
    id="username-field"
    name="username"
    type="username"
    fullWidth
    variant="standard"
    className={classes}
    autoComplete="off"
    helperText={errorMsg}
    error={errorMsg !== ""}
    value={username}
    required
    onChange={(e) => {
      const newUser = e.target.value;
      setUsername(newUser);
      const un = isValidUsername(newUser);
      setErrorMsg(un.isValid || newUser === ""? "" : un.errorMessage);
      setValidUsername(un.isValid || newUser);
    }}
    />
  )
}