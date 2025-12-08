import Layout from "../../components/Layout";
import FlagCards from "./components/FlagCards";
import useLanguages from "../../hooks/useLanguages";
import ExerciseList from "./components/ExerciseList";
import Box from "@mui/material/Box";
import useExercise from "../../hooks/useExercise";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { setL2, l2 } = useLanguages();
  const {exercises, isConsonant, setIsConsonant, setActiveExercise, loading} = useExercise();
  const { t } = useTranslation();
  const { auth } = useAuth();

  const [results, setResults] = useState();

  const handleSelectLanguage = (language) => {
    setL2(language);
  }

  const handleSelectExercise = (type, exercise) => {
    setActiveExercise({type: type, exercise: exercise});
  }

  const getResults = async () => {
    try {
      const response = await fetch(`/api/exercises/results/${l2.name}/${isConsonant}`, {
        method:"GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
      else {
        console.error("Failed fetchings results:", response);
      }
    } catch (error) {
      console.error("Error fetching results:", error)
    }
  }

  useEffect(() => {
    if (auth.token && auth?.token !== 'guest' && l2?.name) {
      getResults();
    }
  }, [l2, auth])

  return (
    <Layout>
      <Box className="flex flex-col items-center justify-start size-full gap-4">
        <FlagCards handleSelectLanguage={handleSelectLanguage}/>
        <Container maxWidth="md" className="flex justify-center py-10 px-20 gap-1 rounded-xl border-2 border-pygblue relative">        
          {
            Object.keys(exercises).map((exerciseType, idx) => {
              return <Stack direction="column" className="flex flex-1 flex-col items-center relative h-60" key={idx}>

                <span className="text-pygblue border-2 rounded-md py-1 px-6 border-pygblue z-10 bg-white absolute -top-14">
                  {t(exerciseType.toUpperCase())}
                </span>

                <ExerciseList exercises={exercises[exerciseType]} type={exerciseType} handleSelectExercise={handleSelectExercise} hideProgress={auth.token === 'guest'} results={results} loading={loading}/>

              </Stack>
            })
          }
          <Button className="text-white rounded-md py-1.5 px-20 z-10 bg-pygblue absolute -bottom-5 shadow-md" onClick={() => {setIsConsonant(!isConsonant)}}>{isConsonant ? t("GO TO VOWELS") : t("GO TO CONSONANTS")}</Button>
        </Container>
      </Box>
    </Layout>
  );
}