import { useContext } from "react";
import LanguagesProvider from "../context/LanguagesProvider";

const useLanguages = () => {
  return useContext(LanguagesProvider);
}

export default useLanguages;