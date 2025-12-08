import Button from '@mui/material/Button';

const PrimaryButton = ({text, style="", ...props}) => {
  return (
    <Button 
    variant="contained" 
    className={`w-fit px-5 py-2 bg-pygblue text-white ${style}`}
    {...props}>
      {text}
    </Button>
  )
}

export default PrimaryButton;