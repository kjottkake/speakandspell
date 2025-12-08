import TextField from "@mui/material/TextField"
import Stack from "@mui/material/Stack"
import { useState } from "react"
import { isValidPassword } from "../../../utils/isValid__"
import { useTranslation } from 'react-i18next';

export default function ChangePassword ({setValidPassword, classes}) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [currentPwError, setCurrentPwError] = useState("");
  const [newPwError, setNewPwError] = useState("");
  const [confirmPwError, setConfirmPwError] = useState("");
  const {t} = useTranslation();

  // TODO: check if current password is the same as entered.
  const validateCurrentPw = () => {
    return {isValid: true, error: ""};
  }

  const validateNewPw = (inputPw) => {
    return isValidPassword(inputPw);
  }

  const validateConfirmPw = (inputPw) => {
    setValidPassword(newPw === inputPw && newPw !== "")
    const isValid = inputPw === newPw;
    return {isValid: isValid, error: !isValid ? "Passwords do not match." : ""};
  }

  const pwTypes = [
    {
      name: 'current',
      label: t('Current password'),
      state: currentPw,
      setState: setCurrentPw,
      error: currentPwError,
      setError: setCurrentPwError,
      validate: validateCurrentPw,
    },
    {
      name: 'new',
      label: t('New password'),
      state: newPw,
      setState: setNewPw,
      error: newPwError,
      setError: setNewPwError,
      validate: validateNewPw,
    },
    {
      name: 'confirm',
      label: t('Confirm password'),
      state: confirmPw,
      setState: setConfirmPw,
      error: confirmPwError,
      setError: setConfirmPwError,
      validate: validateConfirmPw,
    }
  ]

  return (
    <Stack direction={"column"}>
      {
        pwTypes.map((type, idx) => {
          return (
            <TextField 
            label={type.label}
            autoFocus={type.name === "current"} 
            key={idx} 
            id={`passwordfield-${idx}`}
            name={type.name}
            type="password"
            fullWidth
            variant="standard"
            className={classes}
            required
            helperText={type.error}
            error={type.error !== ""}
            value={type.state}
            onChange={(e) => {
              const pwInput = e.target.value;
              type.setState(pwInput);
              const pw = type.validate(pwInput);
              type.setError(pw.isValid ? "" : t(pw.errorMessage));
            }}
            />
          )
        })
      }
    </Stack>
  )
}