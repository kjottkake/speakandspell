import Stack from "@mui/material/Stack";
import { useEffect, useState, useRef } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import DOMPurify from "dompurify";

export default function Spell ({idx, activeIdx, setActiveIdx, setCanShowRules, translation, trialID, word, pronunciation, trialAudioURL, handleNextTrial, isTarget}) {
  const {t} = useTranslation();
  const [value, setValue] = useState('');
  const [trialDuration, setTrialDuration] = useState(1000);
  const [answers, setAnswers] = useState([])

  // button states
  const [canPlaySound, setCanPlaySound] = useState(true);
  const [canShowAnswer, setCanShowAnswer] = useState(false);  
  
  // text states
  const [showAnswer, setShowAnswer] = useState(false);
  const [canAnswer, setCanAnswer] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState('');

  // result states
  const [correct, setCorrect] = useState(null); // 0 for uncorrect answer, 1 for correct answer

  // refs
  const trialAudioRef = useRef(null);
  const inputRef = useRef(null);


  const handlePlaySound = () => {
    setCanPlaySound(false);
    setCorrect(null);
    setCanAnswer(false);
    setCanShowAnswer(false);
    setCanShowRules(false);
    setActiveIdx(idx);

    const trialAudio = trialAudioRef.current;
    trialAudio.currentTime = 0;

    // TODO: uncomment below when trialAudioURL has sound
    // // play trial audio when ready
    // const playTrial = () => {
    //     trialAudio.play().catch((err) => {
    //         console.error("Could not play trial audio:", err);
    //     });
    // };

    // if (trialAudio.readyState >= 4) {
    //     playTrial();
    // } else {
    //     trialAudio.addEventListener("canplaythrough", playTrial, { once: true });
    // }

    // const onTrialEnded = () => {
    //   setCanPlaySound(true);
    //   setCanAnswer(true);
    //   setActiveIdx(null); //activates all three trials
    // }

    // trialAudio.addEventListener("ended". onTrialEnded, { once: true });
    // END TODO
    

    // TODO: delete when audio is available
    setTimeout(() => {
      setCanPlaySound(true);
      setCanAnswer(true);
      setActiveIdx(null);
    }, trialDuration + 500); 
    // DELETE END
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const trimmedValue = value.trim();
    setSubmittedAnswer(trimmedValue);


    if (value.toLowerCase() === word.toLowerCase()) { // correct answer
      setCorrect(true);
      setShowAnswer(true);
      setCanAnswer(false);
      setCanPlaySound(false);

    } else { // incorrect answer
      setCorrect(false);
      setCanShowAnswer(true);
    }

    setValue("");
    setCanShowRules(true);
  }

  const handleContinue = () => {
    setTimeout(() => {
      handleNextTrial();
    }, 500);
  }

  useEffect(() => {
    if (trialAudioURL) {
        const audio = new Audio(trialAudioURL);
        trialAudioRef.current = audio;

        const handleLoadedMetadata = () => {
            const duration = audio.duration;
            setTrialDuration(Math.max(duration * 1000, 1000)); // duration is in milliseconds!
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        // Start loading
        audio.load();

        // Fallback in case metadata never loads (rare)
        const fallback = setTimeout(() => {
            setTrialDuration(1000);
        }, 1000);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            clearTimeout(fallback);
        };
    }
  }, [trialAudioURL])

  useEffect(() => {
    if (activeIdx !== idx && activeIdx !== null) { // activeidx === 0|1|2 with idx1 being the target
      setCanPlaySound(false);
      setCanAnswer(false);
      setCanShowAnswer(false);

    } else {
      setCanPlaySound(true);
    }
  }, [activeIdx])

  useEffect(() => {
    if (isTarget) {
      if (correct !== null) {
        const newScore = {trialID: trialID, score: correct ? 1 : 0, trialWord: word} 
        const resultsSession = sessionStorage.getItem("results");

        if (resultsSession) {
          let results = JSON.parse(resultsSession) || [];

          //check if score is registered for given trialID
          const idx = results.findIndex(r => r.trialID === trialID);

          if (idx !== -1) {
            results[idx] = newScore;
          } else {
            results.push(newScore);
          }

          sessionStorage.setItem("results", JSON.stringify(results));
        } else { sessionStorage.setItem("results", JSON.stringify([newScore]))};
      }
    }
    
  }, [correct, isTarget])

  useEffect(() => {
    if (canAnswer && inputRef.current) {
      inputRef.current.focus();
    }

  }, [canAnswer])


  return (
    <Stack 
    direction={'column'} 
    className={`items-center text-gray-500 size-full ${showAnswer? '': 'pt-10'}`}>
      
      <Box className={`w-full flex flex-col items-center ${showAnswer? "" : "hidden"}`}>
        <span className={`font-bold text-xl`}>{word}</span>

        <span className="pb-2">[{pronunciation}]</span>
        
        <Divider className="w-4/5 h-0.5 rounded bg-gray-200"/>

        <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(translation)}}/>
      </Box>
      

      {/* Play button*/}
      <Button
      variant="contained"
      className={`py-5 rounded-xl w-2/5 items-center my-3
                ${!canPlaySound ? 'bg-blue-200' : 'bg-pygblue'}
                ${showAnswer ? "hidden" : ""}
                `}
      disabled={!canPlaySound}
      onClick={
        handlePlaySound
        }>
      
        <VolumeUpRoundedIcon
        fontSize="large"
        className={`text-white`}
        />

      </Button>

      {/* Input field */}
      
        <form autoComplete="off" onSubmit={handleSubmit} className={`w-full flex justify-center`}>
          <input 
          ref={inputRef}
          type="text"
          name="spell-textfield"
          placeholder={correct === null ? t("Answer here")+"..." : t("Try again") +"?"}
          value={showAnswer ? submittedAnswer : value}
          onChange={(e) => setValue(e.target.value)}
          disabled={showAnswer || !canAnswer}
          className={`bg-inherit border-b-2 text-center p-1 focus:outline-none w-2/3 fill-none border-gray-200
            ${canAnswer && "border-pygblue"}
            ${(correct === false || (showAnswer && correct === false)) && "border-red-400"}
            ${(correct && showAnswer) && "border-green-400"}
          `}/>
        </form>
      
      

      {/* Continue button */}
      {
        isTarget && showAnswer && (
        <Button 
        onClick={handleContinue}
        variant="contained"
        className={`
          bg-pygblue text-white rounded-xl p-2 font-bold mt-5
          `}>
          {t('Continue')}
        </Button>
        )
      }

      {/* Show answer button for non-targets */}
      {
        canShowAnswer && !showAnswer && (
          <Button 
          onClick={() => {setShowAnswer(true)}}
          variant="contained"
          className={`
            bg-pygblue text-white rounded-xl p-2 font-bold mt-2
            `}>
            {t('Show answer')}
          </Button>
        )
      }
      
      
    </Stack>
  )
}

