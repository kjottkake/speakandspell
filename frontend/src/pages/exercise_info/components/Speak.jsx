import Stack from "@mui/material/Stack";
import Divider from '@mui/material/Divider';
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import MicNoneRoundedIcon from '@mui/icons-material/MicNoneRounded';
import LinearProgress from '@mui/material/LinearProgress';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from "dompurify";

// perhaps parameter trial: {trialID, trialSound: {audio, duration}}
export default function Speak({ idx, setCanShowRules, handleNextTrial, isTarget, word, trialID, translation, pronunciation, trialAudioURL, setAnimateRules, disableButtons, setDisableButtons}) {
    const {t} = useTranslation();
    // rating state
    const [rating, setRating] = useState(0);

    // button states
    const [canCompare, setCanCompare] = useState(false);
    const [canRate, setCanRate] = useState(false);
    const [canListen, setCanListen] = useState(false);
    const [canContinue, setCanContinue] = useState(false);

    // audio states
    const [recordingEnded, setRecordingEnded] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [progress, setProgress] = useState(0);
    const [audioURL, setAudioURL] = useState("");
    const [trialDuration, setTrialDuration] = useState(1000);

    // refs
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const trialAudioRef = useRef(null);
    const recordAudioRef = useRef(null);

    const buttonClasses = `bg-pygblue text-white rounded-xl p-2 font-bold [font-size:clamp(0.75rem,1vw,1.25rem)] whitespace-nowrap ${disableButtons && "opacity-50"}`

    const handleRating = (newValue) => {
        if (newValue !== null) {
            setRating(newValue);
            if (newValue === 1) {setAnimateRules(true)}
            else {setAnimateRules(false)};
            // store results in session storage s.t. results: {{trialID, score, trialWord}}
            const newRating = {trialID: trialID, score: newValue, trialWord: word};
            const ratingsSession = sessionStorage.getItem("results");
            
            if (ratingsSession) {
                let ratings = JSON.parse(ratingsSession) || [];

                // check if rating is registered for trialID
                const idx = ratings.findIndex(r => r.trialID === trialID);

                if (idx !== -1) {
                    // update existing rating
                    ratings[idx] = newRating;
                } else {
                    // add new rating
                    ratings.push(newRating);
                }

                sessionStorage.setItem("results", JSON.stringify(ratings));
                
            } else {
                sessionStorage.setItem("results", JSON.stringify([newRating]));
            }
        }
        

        // wait a bit after rating before showing continue button
        const delay = setTimeout(() => {
            setCanContinue(true);
        }, 500);
        
    }

    const playSounds = (target) => {
        const recordingAudio = recordAudioRef.current;
        const trialAudio = new Audio(recordingAudio?.src); // TODO: set to actual audio: trialAudioRef.current

        // ensure both start at the beginning
        recordingAudio.currentTime = 0;
        trialAudio.currentTime = 0;
        
        // play trial audio when ready
        const playTrial = () => {
            trialAudio.play().catch((err) => {
                console.error("Could not play trial audio:", err);
            });
        };

        if (trialAudio.readyState >= 4) {
            playTrial();
        } else {
            trialAudio.addEventListener("canplaythrough", playTrial, { once: true });
        }

         // when trial finishes, wait 500ms then play recorded audio
        const onTrialEnded = () => {
            setTimeout(() => {
                recordingAudio.currentTime = 0;
                recordingAudio.play().catch((err) => {
                    console.error("Could not play recording audio:", err);
                });
            }, 400);
        };
        trialAudio.addEventListener("ended", onTrialEnded, { once: true });
        
        // When audions finish, re-enable controls
        const onRecordingEnded = () => {
            if (target) {
                setCanCompare(true);
                setCanRate(true);
                setCanContinue(false);
            } else {
                setCanListen(true);
            }
            setDisableButtons(false);
            
        };

        recordingAudio.addEventListener("ended", onRecordingEnded, {once: true})
    }

    const handleCompare = () => {
        setCanCompare(false);
        setCanRate(false);
        setDisableButtons(true);
        playSounds(true); //target = true
    }

    const handleListen = () => {
        setCanListen(false);
        setDisableButtons(true);

        playSounds(false); // target = false
    }

    const handleStart = () => {
    if (progress === 0 && !isRecording) {
        setCanRate(false);
        startRecording();
        setRecordingEnded(false);
    }
    }

    const startRecording = async () => {
        try {
            if (navigator) {
                navigator.permissions.query({name: "microphone"}).then(async function (result) {
                    if (result.state !== "granted") {
                        alert("Must grant microphone permission to continue.");
                    }
                });
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            chunksRef.current = []; // clear old chunks

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "mimeType" });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                setRecordingEnded(true);
                setProgress(100);
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setCanShowRules(false);

            } catch (err) {
                console.error("Could not start recording:", err);
                alert(err)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    }

    // sets trialAudioRef
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
    }, [trialAudioURL]);

    // sets recordAudioRef
    useEffect(() => {
        if (audioURL) {
            recordAudioRef.current = new Audio(audioURL);
        }
    }, [audioURL])


    useEffect(() => {
        return (() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        })
    }, [])

    // handle button states when recording has ended
    useEffect(() => {
        if (recordingEnded) {
            setCanCompare(true);
            setCanListen(true);
            setIsRecording(false);
            setCanShowRules(true);
            setProgress(0);
            setDisableButtons(false);
        } 
        else {
            setCanCompare(false);
            setCanListen(false);
        }
        setRating(0);
        
    }, [recordingEnded, progress])

    // reset states for each new trial
    useEffect(() => {
        setRecordingEnded(false);
        setRating(0);
        setCanCompare(false);
        setCanRate(false);
        setCanListen(false);
        setCanContinue(false);
    },[trialID])


    // tracks recording states and handles progress bar animation
    useEffect(() => {
        if (isRecording) {
            setDisableButtons(true);

            const startTime = Date.now();

            // timer for progress bar
            const timer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min((elapsed/(trialDuration+300)) * 100, 100); // progress bar: trialDuration + 300ms
                setProgress(percent);
            }, 50); 

            // timer for stopping the recording 700ms after full progress bar
            const stopTimer = setTimeout(() => {
                stopRecording();
            }, trialDuration + 1000); 

            return () => {
                clearInterval(timer);
                clearTimeout(stopTimer);
            };
        }
    },[isRecording, trialDuration])

    if (!(trialID)) return;

    return (
        <Stack direction={"column"} className={`items-center size-full text-gray-500`}>

            <span className="font-bold text-xl" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(word)}}/>

            <span className={`pb-1 ${!recordingEnded && "invisible"}`}>[{pronunciation}]</span>
            
            <Divider className="w-4/5 h-0.5 rounded bg-gray-200"/>

            <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(translation)}}/>



            {/* Microphone button */}
            <Button
            variant='contained'
            className={`flex flex-col  py-5 gap-1 rounded-xl w-2/5 items-center my-3
                ${disableButtons ? 'bg-blue-200' : 'bg-pygblue'}`}
            disabled={disableButtons || progress !== 0}
            onClick={handleStart}>
                
                <MicNoneRoundedIcon 
                fontSize={"large"} 
                className={`text-white`}/>
                
                <Box className="w-1/2">
                    
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        className={`
                            ${isRecording && progress > 0 ? 'visible' : 'invisible'}
                            rounded-3xl`}
                        />
                </Box>
            </Button>


            
            {   isTarget ?

                // Wrapper for Compare and Rating buttons 
                <Box className={`flex flex-col gap-1 w-2/5`}>
                    <Button 
                    variant="contained"
                    className={` 
                        ${buttonClasses}
                        ${canCompare? 'opacity-100' : 'opacity-50'}`} 
                    disabled={!canCompare || disableButtons}
                    onClick={handleCompare}>
                        {t("Compare")}
                    </Button>

                    <Button 
                    onClick={canContinue ? handleNextTrial : () => {}} 
                    // variant="contained" 
                    disabled={!canRate || disableButtons}
                    className={` 
                        ${buttonClasses} flex justify-center items-center
                        ${canRate ? "opacity-100" : "opacity-50"}`}> 
                        {
                            canContinue ? 
                            t("Continue") :


                            <Rating
                            name="speak-rating"
                            value={rating}
                            max={3}
                            onChange={(_, newVal) => {
                                handleRating(newVal);
                            }}
                            disabled={!canRate || disableButtons}
                            size="small"
                            className={`gap-1 flex flex-row justify-evenly`}                    
                            emptyIcon={<StarIcon fontSize="inherit" className="text-white"/>}
                            />

                        } 
                    </Button>
                       
                </Box>


                : <Button
                    variant="contained"
                    className={` 
                        ${buttonClasses} w-2/5
                        ${canListen ? 'opacity-100' : 'opacity-50'}`}
                    disabled={!canListen || disableButtons}
                    onClick={handleListen}>
                    {t('Listen')}
                </Button>
            }
            
        </Stack>
    )
}