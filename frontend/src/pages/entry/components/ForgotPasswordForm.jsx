import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useState, useEffect} from 'react';

export default function ForgotPasswordForm({open, setOpen}) {
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(null);
  const [email, setEmail] = useState('');
  
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setFeedback('');
      setSuccess(null);
      setEmail('');
    }, 500);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const email = formJson.email;

    try {
      const response = await fetch(`api/users/forgot-pw/${email}`, {
        method: 'POST'
      });

      if(!response.ok) {
        if(response.status === 401) {
          setSuccess(false);
          setFeedback('Email address not registered.')
        }
      } else {
        setSuccess(true);
        setEmail(email);
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
      
    } catch (err) {
      console.error('Error sending activation link:', err);
    }
  };



  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        { 
          success ? 
          <p>Link sent to <span className="font-bold">{email}</span> successfully!</p>:
          "Change Password"
        }
      </DialogTitle>
      {
        !success &&
      <DialogContent className={`pb-2`}>
        <DialogContentText>
          To change your password, please enter your email below. An activation link will be sent to you.  
        </DialogContentText>
        <form onSubmit={handleSubmit} htmlFor="email">
          <TextField
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            className="p-1 border-b"
            error={!success && success !== null}
            helperText={feedback}
          />
          <DialogActions
          className={`flex flex-row gap-5`}>
            <Button 
            className={`text-pygblue font-semibold text-sm`}
            onClick={handleClose}>
              CANCEL
            </Button>
            <Button 
            className={` text-pygblue font-semibold text-sm`}
            type="submit">
              SEND LINK
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
      }
    </Dialog>
  );
}