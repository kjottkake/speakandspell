import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import useAuth from '../hooks/useAuth';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import { Link } from "react-router-dom";
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { auth, setAuth } = useAuth();
  const { t } = useTranslation();

  const handleLogOut = () => {
    setAuth({});
    localStorage.removeItem("token");
    localStorage.removeItem("isConsonant");
    localStorage.removeItem("languages");
  }

  return (
    <Box className="w-full">
      <AppBar position="static" className="bg-inherit text-pygblue shadow-md ">
        <Container maxWidth="xl" > 
          <Toolbar className="flex justify-between items-center">
            <Link to={"/"} className='flex flex-col items-center py-2'>
            <Typography variant="h5" component="div" className="grow font-bold tracking-wide">
              Speak and Spell Test
            </Typography>
            </Link>
            <Box className="flex items-center gap-2">
              <Tooltip title={t("Settings")} className={`${!auth.token || auth.token === "guest" ? "hidden" : ""}`}>
                <Link to="/settings">
                <IconButton aria-label="settings">
                  <AccountCircleIcon fontSize="large"/>
                </IconButton>
                </Link>
              </Tooltip>
              <Button onClick={handleLogOut} variant="contained" className={`py-1 px-3 bg-pygblue text-white`}>
                <Link to="/">{t('Logout')}</Link>
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
