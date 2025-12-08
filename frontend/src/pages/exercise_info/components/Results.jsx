import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import ListItemText from "@mui/material/ListItemText";
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import HorizontalDivider from '../../../components/HorizontalDivider';
import {useEffect} from 'react';
import { useTranslation } from 'react-i18next';

export default function Results ({results, type, auth, activeExercise}) {
  const {t} = useTranslation();

  // either rating or check showing the score for each trial in an exercise
  const Result = ({score}) => {
    if (type === "speak") {
      return (
        <Stack direction={'row'} className={`bg-blue-100 text-white rounded p-0.5 items-center flex justify-center
          ${score >= 2 ? "bg-green-100" : "bg-red-100"}
        `}>
          <Rating
            name="rating-results"
            value={score}
            max={3}
            readOnly
            size="small"
            className={`gap-1`}                    
            emptyIcon={<StarIcon fontSize="inherit" className="text-white"/>}
            />
        </Stack>
      )
    } else if (type === "spell") {
      return (
        <Stack direction={'row'} className={`bg-blue-100 text-white rounded p-0.5 items-center flex justify-center
          ${score === 1 ? "bg-green-100" : "bg-red-100"}
        `}>
          {
            score === 1 ?
            <CheckRoundedIcon/> :
            <ClearRoundedIcon/>
          }
        </Stack>
      )
    }
  }

  // stores result to database
  const postResult = async (progress) => {
    try {
      if (auth?.token === "guest" || !auth?.token || Number.isNaN(progress)) return; // dont save results for guests or unauthorized 
      const response = await fetch(`/api/exercises/result/${activeExercise.exercise.id}/${progress}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      });
      if (!response.ok) {
        console.error("Failed posting result: ", response);
      } 
    } catch (error) {
      console.error("Error posting result: ", error)
    } 
  }

  // returns the average of the numbers in the array scores
  const calculateProgress = (scores) => {
    const sum = scores.reduce((partialSum, a) => partialSum + a, 0);
    return sum / scores.length;
  }

  useEffect(() => {
    if (!results || !type) return; 

    // an array with of 0s and 1s
    const scores = results.map(r => {
      if (type === "speak") {
        return r.score >= 2 ? 1 : 0; // ratings of 2 or 3 are considered "correct"
      } 
      return r.score;
    });

    const progress = Number(calculateProgress(scores).toFixed(2)); 
    postResult(progress);

  }, [results, type])

  return (
    <>
    <Stack direction="column" 
      className="items-center flex gap-5 mt-9 w-2/3 rounded-xl p-5 pt-0">

        <span className={`font-bold text-gray-700`}> {t('Results')} </span>

        <HorizontalDivider width={"2/3"}/>

        <List className="overflow-y-auto w-1/2 scroll-smooth text-gray-600">
          {
            results.map((res, idx) => {

              return (
                <ListItem
                key={idx}
                dense
                className={``}>
                  <ListItemText>{res.trialWord}</ListItemText>
                  <Result score={res.score}/>
                </ListItem>
              )
            })
          }
        </List>

      </Stack>
    
    <Link to={"/home"} className="absolute -bottom-5 ">
      <Button
      variant="contained"
      className={`text-white rounded-md py-1.5 px-20 z-10 bg-pygblue 
        `} 
      >
          {t('GO TO HOMEPAGE')}
      </Button> 
    </Link> 
    </>
  )
}