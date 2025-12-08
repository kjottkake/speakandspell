import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import Speak from "./Speak";
import Spell from "./Spell";
import Button from "@mui/material/Button";
import { useTranslation } from 'react-i18next';

export default function TrialBox ({
    trials, 
    activeTrial, 
    setActiveTrial, 
    l2, 
    languages, 
    type, 
    setShowResults,
    setShowTrials,
    setTrialsClicked
}) {
    const {t} = useTranslation();
    const [orderedLanguages, setOrderedLanguages] = useState([]);
    const [canShowRules, setCanShowRules] = useState(true);
    const [activeIdx, setActiveIdx] = useState(null);
    const [trialNr, setTrialNr] = useState(1);
    const [animateRules, setAnimateRules] = useState(false);
    const [disableButtons, setDisableButtons] = useState(false);

    const centerTargetLanguage = () => {      
        let tempList = [...languages];
        const targetIdx = languages.findIndex(lang => lang?.name === l2?.name);
        if (targetIdx !== 1) {
            [tempList[1], tempList[targetIdx]] = [tempList[targetIdx], tempList[1]];
            setOrderedLanguages(tempList);
        } else {
            setOrderedLanguages(languages);
        }
    }

    // fetches trial based on ID, sets active trial, and stores data in session
    const getTrial = async (id) => {
        try {
            const response = await fetch(`api/exercises/trial/${id}`, {
                method: "GET",
                "Content-Type": "application/json"
            });
            if (response.ok) {
                const data = await response.json();
                const {_id, ...rest} = data.trial;
                const copy = {...rest, id: _id};
                for (let l of ["norwegian", "swedish", "danish"]) {
                    if (copy.is_cognate) {
                        copy[l][word] = `<p style="color: #1E90FF;">${copy[l][word]}</p>"`;
                    }
                }
                setActiveTrial(copy);
            }
        } catch (error) {
            console.error("Error fetching trial: ", error)
        }
    }

    // finds next trial or shows result
    const handleNextTrial = () => {
        const currentIdx = trials.findIndex(trial => trial === activeTrial.id);
        if (currentIdx < trials.length) {
            if (currentIdx +1 === trials.length) {
                setShowResults(true);
            } else {
                getTrial(trials[currentIdx +1]);
            }
        } 
    }

    useEffect(() => {
        if (!activeTrial) {
            getTrial(trials[0]);
        } else {
            const currentIdx = trials.findIndex(trial => trial === activeTrial.id);
            setTrialNr(currentIdx+1);
        }
        setTrialsClicked(true);
        centerTargetLanguage();
    }, [trials, languages, l2])

    if (!trials) return; 

    return (
        <>
        <Stack direction={'row'} className="flex w-full">
            {
                orderedLanguages?.map((language, idx) => {
                    const isTarget = l2?.name === language?.name;

                    return ( activeTrial &&
                        <Stack 
                        key={idx}
                        direction={"column"} 
                        className={`items-center flex-1 pt-9 gap-2 ${isTarget ? 'bg-blue-50' : ''}`}> 

                            {/* Flag icon */}
                            <span className={`${language?.flagClass} text-7xl`}/>

                            {/* Speak or Spell */}
                            {
                                type === "speak" ?

                                <Speak 
                                idx={idx}
                                activeIdx={activeIdx}
                                setCanShowRules={setCanShowRules}
                                handleNextTrial={handleNextTrial} 
                                isTarget={isTarget}
                                word={activeTrial[language?.name]?.word} 
                                disableButtons={disableButtons}
                                setDisableButtons={setDisableButtons}

                                trialID={activeTrial.id} 
                                translation={activeTrial[language?.name]?.english} // placeholder. must insert string translation
                                pronunciation={activeTrial[language?.name]?.pronunciation}
                                trialAudioURL={activeTrial[language?.name]?.sound} 
                                setAnimateRules={setAnimateRules}

                                />

                                : <Spell
                                idx={idx}
                                activeIdx={activeIdx}
                                setActiveIdx={setActiveIdx}
                                setCanShowRules={setCanShowRules}
                                handleNextTrial={handleNextTrial}
                                isTarget={isTarget}

                                translation={activeTrial[language?.name]?.english}
                                trialID={activeTrial.id}

                                word={activeTrial[language?.name]?.word}
                                pronunciation={activeTrial[language?.name]?.pronunciation}
                                trialAudioURL={activeTrial[language?.name]?.sound} 
                                />
                            }
                            
                        </Stack>
                    )
                })
            }
        </Stack>

        <span className={`text-gray-400 absolute right-5 bottom-0`}>
            {t('Trial')} {trialNr} / {trials.length}
        </span>

        <Button 
        variant="contained" 
        disabled={!canShowRules}
        className={`
            ${!canShowRules ? "bg-blue-200": "bg-pygblue" }
            ${animateRules && "animate-bounce"}
            text-white rounded-md py-1.5 px-20 z-10  absolute -bottom-5
            `
        } 
        onClick={() => {setShowTrials(false)}}>
            {t('SHOW RULES')}
        </Button>
        </> 

    )
}

