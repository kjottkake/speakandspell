import useLanguages from '../../../hooks/useLanguages';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import 'flag-icons/css/flag-icons.min.css';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';

export default function SelectLanguageBox() {
  const { languages, setL1, setL2, l1} = useLanguages();
  const [selectL2, setSelectL2] = useState(false); 
  const navigate = useNavigate();

  const handleSelectLanguage = (language) => {
    if (!selectL2) {
      setL1(language);
      setSelectL2(true);
    } else {
      setL2(language);
      navigate('/home');
    }
  }

  return (
    <Container maxWidth="md" className="flex flex-col items-center gap-10 pt-10 pb-20 px-20 border-2 rounded-3xl border-pygblue">        
        <span className="text-pygblue"> SELECT {selectL2 ? "TARGET" : "INSTRUCTION"} LANGUAGE</span>
        <Stack direction="row" className="w-full justify-between items-stretch">
          {languages.map((language, idx) => (
            <React.Fragment key={language.code}>
              <Box className="flex flex-col items-center gap-2" >
                <Button
                  onClick={() => {handleSelectLanguage(language);}}
                  className={`cursor-pointer shadow-lg `}
                  disabled={selectL2 && language.name === l1.name}
                >
                  <span className={`${language.flagClass} text-7xl ${selectL2 && language.name === l1.name ? 'opacity-50' : 'opacity-100'}`}></span>
                </Button>
                <p className="text-gray-600">{(language.code).toUpperCase()}</p>
              </Box>
              {idx < languages.length - 1 && (
                <span
                  className="self-stretch inline-block w-[1px] bg-gray-300 rounded"
                />
              )}
            </React.Fragment>
          ))}
        </Stack>
    </Container>
  );
}