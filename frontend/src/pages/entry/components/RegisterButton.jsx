import PrimaryButton from "../../../components/PrimaryButton";

const RegisterButton = ({text, style="", ...props}) => {
  return (
    <PrimaryButton text={text} style={style} {...props}/>
  )
}

export default RegisterButton;