import TextField from '@mui/material/TextField';

const UsernameTextField = ({text, style="", ...props}) => {
  return (
    <TextField
      variant="standard"
      label={text}
      className={`p-1 border-b ${style}`}
      {...props}
    />
  )
}

export default UsernameTextField;