import useLanguages from '../../../hooks/useLanguages';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

export default function FlagCards({handleSelectLanguage}) {
  const { languages, l2} = useLanguages();

  if (!l2 || !languages) return;
  return (
    <Container maxWidth="md" className="flex flex-col py-5">        
      <Stack direction="row" className="w-full justify-evenly">
        {languages.map((language) => (
            // flag and language code wrapper
            <Box className="flex flex-col items-center gap-1" key={language.code}>
              <Button
                onClick={() => {handleSelectLanguage(language);}}
                className={`shadow-lg rounded-none ${l2.name == language.name ? 'border-8 border-pygblue': 'm-2'}`}
                disableRipple={true}
              >
                <span className={`${language.flagClass} text-6xl h-full`}></span>
              </Button>
              <p className={`${l2.name == language.name ? "text-pygblue" : "text-gray-600"}`}>{(language.code).toUpperCase()}</p>  {/* Button to go to Exercise*/}
            </Box>
            // end of flag and language wrapper
        ))}
      </Stack>
    </Container>
  );
}