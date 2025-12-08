import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import RegisterButton from './components/RegisterButton';
import useAuth from '../../hooks/useAuth';
import useLanguages from '../../hooks/useLanguages';
import { useState, useEffect } from 'react';
import LoginBox from './components/LogInBox';
import RegisterBox from './components/RegisterBox';
import SelectLanguageBox from './components/SelectLanguageBox';
import Header from "./components/Header";
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';

const Entry = () => {
    const {auth, setAuth} = useAuth();
    const {l1, l2} = useLanguages();
    const [ showL1Box, setShowL1Box ] = useState(false);
    const navigate = useNavigate();
    const [test, setTest] = useState("");

    const getTest = async () => {
        const resp = await fetch("api/exercises/test");
        const json = await resp.json();
        setTest(json.text);
    }

    // sets guest auth values and stores this in local storage when the user clicks "Continue as guest"
    const registerGuest = () => {
        const guestUser = {
        username: 'guest',
        email: 'guest',
        token: 'guest',
        };
        setAuth(guestUser);
        localStorage.setItem('token', guestUser.token);
        setShowL1Box(true);
    }

    useEffect(() => {
        if (auth?.token && l1.name && l2.name) {
            navigate('/home'); // Redirect to home if logged in and languages are set
        } else if (auth?.token && (!l1 || !l2)) {
            setShowL1Box(true); // Show language selection if logged in but languages are not set
        } else { // Clear localstorage if not logged in
            localStorage.removeItem('token');
            localStorage.removeItem('languages');
            localStorage.removeItem('isConsonant');
        }
    }, []);

    useEffect(() => {getTest()}, []);

    return <div>
        <Header/>
        <Container maxWidth="md">
            <Stack className="pt-5 pb-10 gap-7">
            {
                showL1Box 
                ? <SelectLanguageBox/>
                : <>
                <LoginBox setShowL1Box={setShowL1Box}/>

                <Divider orientation="horizontal" variant="middle" flexItem/>
                
                <RegisterBox setShowL1Box={setShowL1Box} />

                <Divider orientation="horizontal" variant="middle" flexItem/>

                <Stack direction="row" justifyContent="center" alignItems="center" gap={2}>
                    <RegisterButton 
                    text="Continue as guest"
                    onClick={registerGuest}
                    />
                </Stack>
                </>
            }
            </Stack>
        </Container> 
    </div> 
    
}

export default Entry;
