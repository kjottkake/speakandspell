import TextField from "@mui/material/TextField";
import { useState } from "react";
import {isValidEmail} from "../../../utils/isValid__.js";
import { useTranslation } from 'react-i18next';

export default function ChangeEmail ({classes, setValidEmail}) {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const {t} = useTranslation();

  return (
    <TextField
    autoFocus
    margin="dense"
    id="email-field"
    name="email"
    type="email"
    fullWidth
    autoComplete="off"
    variant="standard"
    className={classes}
    helperText={errorMsg}
    error={errorMsg !== ""}
    value={email}
    required
    onChange={(e) => {
      setEmail(e.target.value);
      const em = isValidEmail(e.target.value);
      setErrorMsg(em.isValid ? "" : t(em.errorMessage));
      setValidEmail(em.isValid);
    }}
    />
  )
}