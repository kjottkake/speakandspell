import { useContext } from "react";
import ExerciseProvider from "../context/ExerciseProvider";

const useExercise = () => {
  return useContext(ExerciseProvider);
}

export default useExercise;