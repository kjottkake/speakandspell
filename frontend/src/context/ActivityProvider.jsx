import { createContext, useState } from "react";
const ActivityContext = createContext({})
export const ActivityProvider = ({children}) => {
    const [activity, setActivity] = useState({        
    })
    return <ActivityContext.Provider value={{activity, setActivity}}>
        {children}
    </ActivityContext.Provider>
}
export default ActivityContext;