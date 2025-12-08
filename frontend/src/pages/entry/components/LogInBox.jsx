import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import UsernameTextField from './UsernameTextField';
import PasswordTextField from './PasswordTextField';
import RegisterButton from './RegisterButton';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useState, useEffect } from 'react';
import { isValidEmail, isValidUsername, isValidPassword } from '../../../utils/isValid__'; 
import useAuth from '../../../hooks/useAuth';
import useLanguages from '../../../hooks/useLanguages';
import {getUserData} from '../../../utils/getUserData'; 
import { getUserLanguages } from '../../../utils/getUserLanguages';
import { useNavigate } from 'react-router-dom';

export default function LogInBox({setShowL1Box}) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailOrUsernameError, setEmailOrUsernameError] = useState(false);
  const [emailOrUsernameErrorMessage, setEmailOrUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [open, setOpen] = useState(false); // forgot password state

  const { setAuth } = useAuth();
  const { setL1, setL2, languages } = useLanguages();
  const navigate = useNavigate();

  const handleOpenPopUp = () => {
    setOpen(true);
  }


  const getLanguageObject = (lang) => {
    return languages.filter(l => l.name === lang)[0];
  }

  const validateInputs = () => {
    let valid = true;
    if (!emailOrUsername) {
      setEmailOrUsernameError(true);
      setEmailOrUsernameErrorMessage('Email or username is required');
      valid = false;
    } else {
      const userValidation = emailOrUsername.includes('@') ? isValidEmail(emailOrUsername) : isValidUsername(emailOrUsername);
      setEmailOrUsernameError(!userValidation.isValid);
      setEmailOrUsernameErrorMessage(userValidation.errorMessage);
      valid = userValidation.isValid;
    }

    if (!password) {
      setPasswordError(true);
      setPasswordErrorMessage('Password is required');
      valid = false;
    } else {
      const passwordValidation = isValidPassword(password);
      setPasswordError(!passwordValidation.isValid);
      setPasswordErrorMessage(passwordValidation.errorMessage);
      valid = passwordValidation.isValid;
    }
    return valid;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await fetch(`api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailOrUsername,
          password: password
        })
      });
      if (response.ok) {
        const token = (await response.json()).token;
        const userData = await getUserData(token);
        const languagesData = await getUserLanguages(token);

        if (userData) {
          setAuth({
            email: userData.email,
            username: userData.username,
            token: token,
          });
          localStorage.setItem("token", token);
          if (languagesData) {
            setL1(getLanguageObject(languagesData.l1));
            setL2(getLanguageObject(languagesData.l2));     
            navigate('/home'); // Navigate to home page after login
            setShowL1Box(false); 
          }
          else {
            setShowL1Box(true);
          }
        } else {
          console.error("Failed to fetch user data after login.");
        }
      } else {
        switch(response.status) {
          case 401:
            setPasswordError(true);
            setEmailOrUsernameError(true);
            setPasswordErrorMessage("Wrong username or password.");
            break;
          case 500:
            console.error("Server error, please try again later.", response);
            break;
          default:
            console.error("An unexpected error occurred.", response);
            setEmailOrUsernameError(true);
            setPasswordError(true);
            setPasswordErrorMessage("Unknown error occurred.");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      setEmailOrUsernameError(true);
      setPasswordError(true);
      setPasswordErrorMessage("An error occurred while logging in.");
    }
  };

  return (
    <Box className="flex flex-col items-center">
      <h2 className="font-bold">Login</h2>
      <Box 
      sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
      component="form" 
      className="flex flex-col items-center"
      onSubmit={handleSubmit}
      noValidate
      >
      <FormControl htmlFor="emailOrUsername" className="w-full">
          <UsernameTextField
            id="emailOrUsername"
            text="Username or Email"
            required
            error={emailOrUsernameError}
            helperText={emailOrUsernameErrorMessage}
            autoComplete="username"
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
          />
        </FormControl>
        <FormControl htmlFor="password" className="w-full">
          <PasswordTextField
            id="password"
            text="Password"
            required
            error={passwordError}
            helperText={passwordErrorMessage}
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </FormControl>
        <RegisterButton type="submit" text="Login" style="mt-3" onClick={validateInputs}/>
      </Box>
      <Button
        className={`text-sm border-b border-b-gray-400 text-gray-500 mt-3 rounded-none w-fit`}
        onClick={handleOpenPopUp}
        >
          Forgot password?
      </Button>
      <ForgotPasswordForm open={open} setOpen={setOpen}/>
    </Box>
  )
}