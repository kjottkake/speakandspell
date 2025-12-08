import { 
    BrowserRouter, 
    Route, 
    Routes
} from 'react-router-dom';

import { AuthProvider } from './context/AuthProvider';
import { ActivityProvider } from './context/ActivityProvider';
import { LanguagesProvider } from './context/LanguagesProvider';
import { ExerciseProvider } from './context/ExerciseProvider';
import Entry from './pages/entry/Entry';
import Error from './pages/error/Error';
import ExerciseInfo from './pages/exercise_info/ExerciseInfo'; 
import Home from './pages/home/Home';
import Settings from './pages/settings/Settings';
import ResetPassword from './pages/reset_pw/ResetPassword';


const App = () => (
    
    <AuthProvider>
    <LanguagesProvider>
    <ExerciseProvider>
    <ActivityProvider>
        <BrowserRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true}}
        >
            <Routes>
                <Route path="/" element={<Entry />} />
                <Route path="/home" element={<Home />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/exercise/:id" element={<ExerciseInfo />} />
                <Route path="/resetpassword/:id/:code" element={<ResetPassword />} />
                <Route path="*" element={<Error />} />
            </Routes>
        </BrowserRouter>
    </ActivityProvider>
    </ExerciseProvider>
    </LanguagesProvider>
    </AuthProvider>
);

export default App;