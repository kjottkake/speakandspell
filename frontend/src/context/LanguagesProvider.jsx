import { createContext, useState, useEffect, useContext, useMemo } from "react";
import AuthContext from "./AuthProvider"; 
import Danish from '../images/flags/danish.png';
import Norwegian from '../images/flags/norwegian.png';
import Swedish from '../images/flags/swedish.png';
import { useTranslation } from 'react-i18next';

const LanguagesContext = createContext({});

export const LanguagesProvider = ({children}) => {
  const [l1, setL1] = useState({});
  const [l2, setL2] = useState({});

  const { auth } = useContext(AuthContext);
  const { i18n } = useTranslation();
  const isLoggedIn = !!auth?.token && auth?.token !== "guest"; // Check if the user is logged in

  // use flagClass in classnames of span elements to display flags
  // use flagImage in src of img elements to display flags
  const languages = [
    { code: 'se', name: 'swedish', flagClass: 'fi fi-se', flagImage: Swedish}, // for square format add fis in className. Use: <span className={`${language.flag}`}></span>
    { code: 'no', name: 'norwegian', flagClass: 'fi fi-no', flagImage: Norwegian },
    { code: 'dk', name: 'danish', flagClass: 'fi fi-dk', flagImage: Danish },
    // { code: 'en', name: 'english' }
  ];

  const updateL1 = (newL1) => {
    if (!newL1.name) return;
    if (isLoggedIn) {
      fetch(`api/users/update-l1/${newL1.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          console.error("Failed to update l1", response);
        }
      })
      .catch(error => console.error("Error updating l1:", error));
    } else if (auth.token === 'guest') {
      localStorage.setItem('languages', JSON.stringify({ l1: newL1, l2 }));
    }

    setL1(newL1);

    // handles translation given updated l1
    i18n.changeLanguage(newL1.code);
  };

  const updateL2 = (newL2) => {
    if (isLoggedIn) {
      fetch(`api/users/update-l2/${newL2.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          console.error("Failed to update l2", response);
        }
      })
      .catch(error => console.error("Error updating l2:", error));
    } else if (auth.token === 'guest') {
      localStorage.setItem('languages', JSON.stringify({ l1, l2: newL2 }));
    }
    setL2(newL2);
  };

  const getLangObject = (lang) => {
    return languages.filter(l => l.name === lang)[0];
  }

  const getLanguages = async () => {
    if (isLoggedIn) { // get languages from database
      try {
        // Fetch l1 and l2 in parallel
        const [l1Res, l2Res] = await Promise.all([
          fetch(`api/users/get-l1`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`
            }
          }),
          fetch(`api/users/get-l2`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`
            }
          })
        ]);

        if (l1Res.ok) {
          const l1Value = (await l1Res.json()).l1;
          setL1(getLangObject(l1Value));
          i18n.changeLanguage(getLangObject(l1Value).code);
        } else {
          setL1({});
          console.error("Failed to fetch l1", l1Res);
        }

        if (l2Res.ok) {
          const l2Value = (await l2Res.json()).l2;
          setL2(getLangObject(l2Value));
        } else {
          setL2({});
          console.error("Failed to fetch l2", l2Res);
        }

      } catch (error) {
        setL1(null);
        setL2(null);
        localStorage.removeItem('languages');
        console.error("Error fetching languages:", error);
      }
    } else {
      // Guest: load from localStorage
      const languagesHistory = localStorage.getItem('languages');
      if (languagesHistory) {
        const parsed = JSON.parse(languagesHistory);
        setL1(parsed.l1 || null);
        setL2(parsed.l2 || null);
      } else {
        setL1(null);
        setL2(null);
      }
    }
  }


  useEffect(() => {
    getLanguages();
  }, [auth]);

  const value = useMemo(() => ({
    l1,
    setL1: updateL1,
    l2,
    setL2: updateL2,
    languages,
    getLangObject
  }), [l1, l2, languages]);

  return <LanguagesContext.Provider value={value}>
      {children}
  </LanguagesContext.Provider>
}
export default LanguagesContext;