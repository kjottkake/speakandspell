import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {useState} from 'react';
import { useTranslation } from 'react-i18next';

export default function ChangeL1({languages, l1}) {
  const [language, setLanguage] = useState(l1.name);
  const {t} = useTranslation();

  const handleChange = (event) => {
    setLanguage(event.target.value)
  };

  return (
    <Select
      labelId="l1-label"
      id="l1"
      value={language}
      name="l1"
      label=""
      onChange={handleChange}
    >
      {
        languages.map((lang, idx) => {
          return(
            <MenuItem key={idx} value={t(lang.name)}>{lang.name}</MenuItem>
          )
        })
      }
    </Select>
  );
}
