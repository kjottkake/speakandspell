import { useContext } from "react";
import ActivityContext from "../context/ActivityProvider";
const useActivity = () => {
    return useContext(ActivityContext)
}
export default useActivity;