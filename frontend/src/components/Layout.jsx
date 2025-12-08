import Box from '@mui/material/Box';
import Header from './Header'; 
import Container from '@mui/material/Container';
import useAuth from '../hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const {auth} = useAuth();
  const navigate = useNavigate();

  // Layout is used only in pages where a user must be logged in. Using Layout automatically sends unlogged user to entry page.
  useEffect(() => {
    if (!auth?.token) {
      navigate("/");
    }
  },[auth]) 

  return (
    <Box className="w-screen h-screen max-h-screen flex flex-col m-0 p-0 relative overflow-hidden">
      <Header />
      <Container maxWidth="xl" className={`flex min-h-0 p-3 flex-1 justify-center`}>
        {children}
      </Container>
    </Box>
  );
}
