import Box from '@mui/material/Box';
import UsernameTextField from './UsernameTextField';
import PasswordTextField from './PasswordTextField';
import RegisterButton from './RegisterButton';
import FormControl from '@mui/material/FormControl';
import { useState } from 'react';
import { isValidEmail, isValidUsername, isValidPassword } from '../../../utils/isValid__'; 
import useAuth from '../../../hooks/useAuth';
import {getUserData} from '../../../utils/getUserData'; 


export default function RegisterBox({setShowL1Box}) {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [passwordRepeatError, setPasswordRepeatError] = useState(false);
  const [passwordRepeatErrorMessage, setPasswordRepeatErrorMessage] = useState('');

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const { setAuth } = useAuth();

  const validateInputs = () => {
    const usernameValidation = isValidUsername(username);
    setUsernameError(!usernameValidation.isValid);
    setUsernameErrorMessage(usernameValidation.errorMessage);

    const emailValidation = isValidEmail(email);
    setEmailError(!emailValidation.isValid);
    setEmailErrorMessage(emailValidation.errorMessage);

    const password1Validation = isValidPassword(password1);
    setPasswordError(!password1Validation.isValid);
    setPasswordErrorMessage(password1Validation.errorMessage);

    const password2Validation = password1 === password2;
    setPasswordRepeatError(!password2Validation);
    setPasswordRepeatErrorMessage(password2Validation ? '' : 'Passwords do not match.');

    return (
      usernameValidation.isValid &&
      emailValidation.isValid &&
      password1Validation.isValid &&
      password2Validation
    );
  }

  const resetFields = () => {
    setUsername("");
    setEmail("");
    setPassword1("");
    setPassword2("");
    setUsernameError(false);
    setUsernameErrorMessage("");
    setEmailError(false);
    setEmailErrorMessage("");
    setPasswordError(false);
    setPasswordErrorMessage("");
    setPasswordRepeatError(false);
    setPasswordRepeatErrorMessage("");
  };

  const checkUserExists = async () => {
    try {
      let usernameExists = false;
      let emailExists = false;
      console.log("Checking if user exists with username:", username, "and email:", email);
      const usernameResponse = await fetch(`api/users/name-exists/${username}`);
      if (usernameResponse.ok) {
        const data = await usernameResponse.json();
        if (data.exists) {
          setUsernameError(true);
          setUsernameErrorMessage("Username already exists.");
          usernameExists = true; // Username exists
        }
      } else {
        console.error("Error checking username:", usernameResponse);
        setUsernameError(true);
        setUsernameErrorMessage("Error checking username.");
      }

      const emailResponse = await fetch(`api/users/email-exists/${email}`);
      if (emailResponse.ok) {
        const data = await emailResponse.json();
        if (data.exists) {
          setEmailError(true);
          setEmailErrorMessage("Email already exists.");
          emailExists = true; // Email exists
        }
      } else {
        console.error("Error checking email:", emailResponse);
        setEmailError(true);
        setEmailErrorMessage("Error checking email.");
      }

      if (!usernameExists && !emailExists) {
        return false; // User does not exist
      }
      return true; // User exists

    } catch (error) {
      console.error("Error in checkUserExists:", error);
      setUsernameError(true);
      setUsernameErrorMessage("Error checking username.");}
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    try {
      // check if user already exists
      // const userExists = await checkUserExists(username, email);
      // if (userExists) {
      //   // User already exists, handle the error
      //   resetFields();
      //   console.error("User already exists with this username or email.");
      //   return;
      // }
      await checkUserExists();
      // If user does not exist, proceed to register
      const response = await fetch('api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password1,
          l1: '',
          l2: '',
        }),
      });
      if (response.ok) {
        const loginResponse = await fetch('api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password1,
          }),
        });

        const token = await loginResponse.json();
        const userData = await getUserData(token.token);
        if (userData) {
          setAuth({
            username: userData.username,
            email: userData.email,
            token: token.token,
          });
          setShowL1Box(true);
        }
        resetFields();
      } else {
        switch (response.status) {
          case 409: 
            const respJson = await response.json();
            switch(respJson.detail.split(" ")[2]) {
                case "username": 
                  setUsernameError(true);
                  setUsernameErrorMessage("Username already exists");
                  break;
                case "email":
                  setEmailError(true);
                  setEmailErrorMessage("Email already exists");
                  break;
            }
            break;
          case 500:
            console.error("Server error, please try again later.", response);
            break;
          default:
            console.error("An unexpected error occurred.", response);
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      resetFields();
    }
  }

  return (
    <Box className="flex flex-col items-center">
      <h2 className="font-bold">Create New Account</h2>
      <Box 
      sx={{ '& > :not(style)': { m: 0.3, width: '25ch' } }}
      component="form" 
      className="flex flex-col items-center"
      onSubmit={handleSubmit}
      noValidate
      >
        <FormControl htmlFor="registerUser" className="w-full">
          <UsernameTextField
            id="registerUser"
            text="Username"
            type="text"
            autoComplete="username"
            required
            error={usernameError}
            helperText={usernameErrorMessage}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl htmlFor="registerEmail" className="w-full">
          <UsernameTextField
            id="registerEmail"
            text="Email"
            type="email"
            autoComplete="email"
            required
            error={emailError}
            helperText={emailErrorMessage}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl htmlFor="registerPass1" className="w-full">
          <PasswordTextField
            id="registerPass1"
            text="Select Password"
            required
            error={passwordError}
            helperText={passwordErrorMessage}
            value={password1}
            onChange={e => setPassword1(e.target.value)}
          />
        </FormControl>
        <FormControl htmlFor="registerPass2" className="w-full">
          <PasswordTextField
            id="registerPass2"
            text="Repeat Password"
            required
            error={passwordRepeatError}
            helperText={passwordRepeatErrorMessage}
            value={password2}
            onChange={e => setPassword2(e.target.value)}
          />
        </FormControl>
        <RegisterButton text="Register" style="mt-3" type="submit" onClick={validateInputs}/>
      </Box>
    </Box>
  )
}