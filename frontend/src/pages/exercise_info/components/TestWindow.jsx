import { useState, useEffect } from "react";

const TestWindow = ({trials}) => {
    const [words, setWords] = useState([]);
    
    const GetWords = async () => {
        let wordArr = [];
        for (let trial of trials) {
            const response = await fetch(`api/exercises/trial/${trial}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const json = await response.json();
            wordArr.push({
                swedish: json.trial.swedish,
                norwegian: json.trial.norwegian,
                danish: json.trial.danish
            });
        }
        setWords(wordArr);
    }

    useEffect(() => {
        if (trials) {
            GetWords();
        }
    }, [trials]);

    return <div className="grid grid-cols-3 border-4 border-red-300">
        <div>Swedish</div>
        <div>Norwegian</div>
        <div>Danish</div>
        {words.map(word => <>
            <div>{word.swedish.word}</div>
            <div>{word.norwegian.word}</div>
            <div>{word.danish.word}</div>
        </>)}
    </div>
}

export default TestWindow;