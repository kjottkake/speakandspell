import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import useLanguages from '../hooks/useLanguages';
import useAuth from "../hooks/useAuth";

const ExerciseContext = createContext({});

export const ExerciseProvider = ({children}) => {
  const { l2 } = useLanguages();
  const {auth} = useAuth();
  const [exercises, setExercises] = useState([]);
  const [activeExercise, setActiveExercise] = useState(); //{type: "speak" | "spell", exercise}
  const [loading, setLoading] = useState(false);
  const [isConsonant, setIsConsonant] = useState(() => {
    const consonantHistory = localStorage.getItem('isConsonant');
    if (consonantHistory) {
      return JSON.parse(consonantHistory);
    } else {localStorage.setItem("isConsonant", JSON.stringify(true))};
    return true;
  });

  const updateIsConsonant = useCallback((value) => {
    setIsConsonant(value);
    localStorage.setItem('isConsonant', value);
  }, []);

// fetches exercises from database and sets exercises {'speak': Array[], 'spell': Array[]}
  const getExercises = useCallback(async () => {
    setLoading(true);
    try {
        const response = await fetch(`api/exercises/exercise-list/${l2.name}/${isConsonant}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (response.ok) {
            const data = await response.json();
            setExercises(data.exercises);
        } else {
            throw new Error(`Error fetching exercises: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Failed to fetch exercises:", error);
        throw error; // Re-throw the error for further handling if needed
    } finally {
      setLoading(false);
    }
  }, [l2, isConsonant]);


//   sets exercises when l2 and consonant changes
  useEffect(() => {
    if (auth.token && l2?.name) {
      getExercises();
    }
  }, [auth, isConsonant, l2, getExercises])

  const value = useMemo(() => ({
    exercises,
    isConsonant,
    setIsConsonant: updateIsConsonant,
    activeExercise,
    setActiveExercise,
    loading
  }), [exercises, isConsonant, updateIsConsonant, activeExercise, setActiveExercise, loading]);

  return <ExerciseContext.Provider value={value}>
      {children}
  </ExerciseContext.Provider>
}
export default ExerciseContext;