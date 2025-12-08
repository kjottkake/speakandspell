import IconButton from "@mui/material/IconButton";
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';

export default function PlaySoundButton({iconSize, ...props}) {
    return (
        <IconButton {...props}>
            <VolumeUpRoundedIcon fontSize={iconSize} className="text-white bg-pygblue rounded"/>
        </IconButton>
    )
}