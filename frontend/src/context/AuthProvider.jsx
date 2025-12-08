import { createContext, useState, useEffect, useMemo } from "react";

const AuthContext = createContext({})
export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('token');
        return token ? {
            email: null,
            username: null,
            token: token,
        } : {
            email: null,
            username: null,
            token: null,
        }
    });
      
    const updateAuth = (newAuth) => {
        setAuth(newAuth);
        localStorage.setItem('token', newAuth.token);
    }
    const checkToken = async () => {
        const token = localStorage.getItem('token');
        if (token && token !== 'guest' && !auth?.email) { // if token exists and user is not already authenticated
            const response = await fetch (`api/users/me`, {
                method: "GET",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setAuth({
                    username: userData.username,
                    email: userData.email,
                    token: token,
                });
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
                setAuth({
                    username: '',
                    email: '',
                    token: '',
                });
                console.error("Failed to fetch user data", response);
            }
        } else if (token === 'guest') {
            setAuth({
                username: 'guest',
                email: 'guest',
                token: 'guest',
            });
        }
    }

    useEffect(() => {
        // checks token on initial render
        checkToken();
    }, []);

    // to avoid unnecessary re-renders, we use useMemo to memoize the context value
    // this way, the context value will only change when auth changes
    const value = useMemo(() => ({
        auth,
        setAuth: updateAuth,
    }), [auth]);

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}
export default AuthContext