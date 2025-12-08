
export default function HorizontalDivider ({color="gray-300", width="full", thickness=" ", classes}) {
  return (
    <span className={`border${thickness !== " " ? "-"+ thickness : " "} border-${color} w-${width} rounded-xl ${classes}`}/> 
  )
}