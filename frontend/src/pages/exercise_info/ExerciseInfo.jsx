import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import useExercise from "../../hooks/useExercise";
import useLanguages from "../../hooks/useLanguages";
import useAuth from "../../hooks/useAuth";
import Layout from "../../components/Layout";
import RulesList from "./components/RulesList";
import TrialBox from "./components/TrialBox";
import Results from "./components/Results"
import TestWindow from "./components/TestWindow";
import { useTranslation } from 'react-i18next';
import DOMPurify from "dompurify";

export default function ExerciseInfo () {
    const { activeExercise } = useExercise();
    const { l2, languages } = useLanguages(); //use l1 to translate portions of the ui
    const { auth } = useAuth();
    const {t} = useTranslation();
    const [rules, setRules] = useState(null);
    const [trials, setTrials] = useState(null);
    const [showTrials, setShowTrials] = useState(false);
    const [activeTrial, setActiveTrial] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState([]);
    const [trialsClicked, setTrialsClicked] = useState(false);

    const navigate = useNavigate();
    
    // fetch rules from the database and sets values for rules and trials
    const getRules = async () => {
        try {
            const response = await fetch(`api/exercises/exercise/${activeExercise.exercise.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRules(data.rules);
                setTrials(data.trials);
            } else {
                console.error("Failed fetching results: ", response);
            }
        } catch (err) {
            console.error("Error fetching results: ", err);
        }
    }

 
    useEffect(() => {
        if (!activeExercise) {
            navigate("/home");
            sessionStorage.removeItem("results")
        } else {
            getRules();
        }
        
        return (() => {
            sessionStorage.removeItem("results");
        })
    }, [activeExercise])


    // reset states when showing final results of the exercise
    useEffect(() => {
        if (showResults) {
            setRules(null);
            setTrials(null);
            setShowTrials(false);
            
            const resultsSession = sessionStorage.getItem("results");
            if (resultsSession) {
                const results = JSON.parse(resultsSession) || [];
                setResults(results);
            }
        }
    }, [showResults])


 
    // Trial or Rules components
    const ToggleBoxes = () => {
        return (
            showTrials && rules? 
            <TrialBox 
            trials={trials} 
            activeTrial={activeTrial} 
            setActiveTrial={setActiveTrial} 
            l2={l2} 
            languages={languages} 
            type={activeExercise.type}
            setShowResults={setShowResults}
            setShowTrials={setShowTrials}
            setTrialsClicked={setTrialsClicked}
            />
            
            : <RulesList 
            setShowTrials={setShowTrials}
            rules={rules} 
            language={(languages.filter((lang) => lang?.name === l2?.name))[0]}
            trialsClicked={trialsClicked}/>
        )
    }

    
    return (
        activeExercise && 
        <Layout>
            <Container maxWidth="md" 
            className="flex rounded-2xl border-2 border-pygblue w-4/5 h-[430px] mt-5 justify-center relative pb-7">     

                {/* Speak | Spell : rule*/}
                <span className="text-pygblue border-2 rounded-md py-1 px-6 border-pygblue z-10 bg-white absolute -top-5">
                    {t(activeExercise.type?.toUpperCase()) || ""} : <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(activeExercise.exercise?.target || "")}} />
                </span>

                {
                    showResults ? 
                    <Results activeExercise={activeExercise} results={results} type={activeExercise.type} auth={auth}/> :
                    <ToggleBoxes/>
                }

            </Container>
            {/*<TestWindow trials={trials} />*/}
        </Layout>
    )
}