import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import PlaySoundButton from "../../../components/PlaySoundButton";
import Button from "@mui/material/Button";
import { useTranslation } from 'react-i18next';
import DOMPurify from "dompurify";
import useLanguages from "../../../hooks/useLanguages";

export default function RulesList({rules, language, setShowTrials, trialsClicked}) {
    const {t} = useTranslation();
    const {l1} = useLanguages();

    // TODO implement playing sound of example soundfiles
    const playSound = (soundFile) => {
        console.log('playing ', soundFile);
    }
    if (!rules || !language) return;

    return (
        <>
        <Stack direction="column" 
        className="bg-blue-50 items-center flex gap-5 pt-9 w-1/3">

            <span className={`${language.flagClass} text-7xl`}/>

            <List className="overflow-y-auto w-full scroll-smooth text-gray-700">
                {
                    rules.map((rule, idx) => {
                        return (
                            <ListItem key={idx} className="flex flex-col items-start gap-1">

                                {/* Rule text */}
                                <ListItemText>
                                    <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(`${idx+1}. ${rule[l1?.name]}`)}}/>
                                </ListItemText>

                                {/* Row of sound examples */}
                                <List className={`flex flex-wrap max-w-full ${trialsClicked && "hidden"}`} dense>
                                    {
                                        rule.examples?.map((ex, idx) => 
                                            <ListItem className="gap-2 w-auto flex-initial px-2" key={idx}>
                                                <PlaySoundButton 
                                                onClick={() => {playSound(`${ex}SoundFile`)}}/> {/* TODO: insert sound file */}
                                                <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(ex)}}/>
                                            </ListItem>
                                        )
                                    }
                                   
                                </List>

                            </ListItem>
                        )
                    })
                }
            </List>

        </Stack>

        <Button 
        variant="contained" 
        className={`
            bg-pygblue
            text-white rounded-md py-1.5 px-20 z-10  absolute -bottom-5`
        } 
        onClick={() => {setShowTrials(true)}}>
            {t('GO TO EXERCISE')}
        </Button>
        </> 
        
    )
}