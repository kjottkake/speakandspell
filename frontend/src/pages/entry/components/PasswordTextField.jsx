import TextField from '@mui/material/TextField';

const PasswordInput = ({id, text, style="", ...props}) => {

  return (
    <TextField
      variant="standard"
      id={id}
      label={text}
      type="password"
      autoComplete="current-password"
      className={`p-1 border-b ${style}`}
      {...props}
    />
  )
}

export default PasswordInput;