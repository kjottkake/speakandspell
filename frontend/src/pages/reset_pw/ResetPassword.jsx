import { useState } from "react"
import { useParams } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import { isValidPassword } from '../../utils/isValid__'; 

const ResetPassword = () => {
    const {id, code} = useParams();
    const [pw, setPw] = useState("");
    const [confirm, setConfirm] = useState("");
    const [success, setSuccess] = useState(false);
    const [err, setErr] = useState(false);
    const [pwErrorMsg, setPwErrorMsg] = useState('');
    const [matchError, setMatchError] = useState(false);
    const matchErrorMsg = "Passwords do not match.";

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (confirm !== pw) {
        setMatchError(true);
        setSuccess(false);
        return;
      }

      // check if password is valid
      const password = isValidPassword(pw);
      if (!password.isValid) {
        setMatchError(false);
        setSuccess(false);
        setErr(true);
        setPwErrorMsg(password.errorMessage);
        return;
      }

      try {
        const response = await fetch(`api/users/reset-pw/${id}/${code}/${pw}`, {
          method: "POST",
        });
        if (response.ok) {
          setSuccess(true);
          setErr(null);
        } else {
          alert("Error. Close this page and try resending new link to your email.");
        }
      } catch (error) {
        console.error('Error submitting new password:', error)
      }
    }

    return (
      <Container maxWidth="sm" className="max-h-screen h-screen flex justify-center items-center">
        <Paper square={false}
        className={`w-full px-10 pt-10 pb-7 flex flex-col`}>
          {
            success ? 
            <p className="text-center text-gray-800"> Success! You can close this page.</p> :
            <>
            <p className="text-gray-500 font-bold">Enter a new password below.</p>
            <Stack direction="column" component="form" onSubmit={handleSubmit}>
              <FormControl htmlFor="password1">
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  id="password1"
                  name="password1"
                  label="Password"
                  type="password"
                  fullWidth
                  variant="standard"
                  className="p-1 border-b"
                  onChange={e => {setPw(e.target.value); setErr(false)}}
                  error={err}
                  helperText={err ? pwErrorMsg : ''}
                />
              </FormControl>
              <FormControl htmlFor="password2">
                <TextField
                  required
                  margin="dense"
                  id="password2"
                  name="password2"
                  label="Repeat Password"
                  type="password"
                  fullWidth
                  variant="standard"
                  className="p-1 border-b"
                  onChange={e => {setConfirm(e.target.value); setMatchError(false)}}
                  error={matchError}
                  helperText={matchError ? matchErrorMsg : ''}
                />
              </FormControl>
              <Box className="flex w-full justify-end mt-4 px-4">
                <Button className="text-pygblue font-bold text-sm"
                type="submit"
                >
                  RESET PASSWORD
                </Button>
              </Box>
            </Stack>
            </>
          }
        </Paper>
      </Container>
    )
}

export default ResetPassword;
