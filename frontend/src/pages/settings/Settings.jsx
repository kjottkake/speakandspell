import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Container from "@mui/material/Container";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from "@mui/material/Divider";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Layout from "../../components/Layout";
import useAuth from "../../hooks/useAuth";
import useLanguages from "../../hooks/useLanguages";
import { useEffect, useState }  from "react";
import { useNavigate } from "react-router-dom";
import ChangeUsername from "./components/ChangeUsername";
import ChangeEmail from "./components/ChangeEmail";
import ChangeL1 from "./components/ChangeL1";
import ChangePassword from "./components/ChangePassword";
import { useTranslation } from 'react-i18next';


export default function SettingsV2 () {
  const {auth, setAuth} = useAuth();
  const {l1, setL1, languages, getLangObject} = useLanguages();
  const {t} = useTranslation();
  const [items, setItems] = useState();
  const [resultsDeleted, setResultsDeleted] = useState(false);


  // BUTTON STATES
  const [openDeleteAccount, setOpenDeleteAccount] = useState(false);
  const [openDeleteResults, setOpenDeleteResults] = useState(false);
  const [changeUsername, setChangeUsername] = useState(false);
  const [changeEmail, setChangeEmail] = useState(false);
  const [changeL1, setChangeL1] = useState(false);
  const [changePw, setChangePw] = useState(false);

  // INPUT STATES
  const [validUsername, setValidUsername] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);

  const nav = useNavigate();
  const buttonClasses = "p-2 text-sm font-semibold text-gray-500 hover:text-red-700"
  const textFieldClasses = "border-b pr-5 m-0"


  const handleClose = () => {
    setOpenDeleteAccount(false);
    setOpenDeleteResults(false);
    // reset results states
    setTimeout(() => {
      setResultsDeleted(false);
    }, 200);
  }

  const editUsername = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('username');
    try {
      const response = await fetch(`/api/users/update-username/${value}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      })
      if (response.ok) {
          setAuth({...auth, username: value})
      }
      else {
        if (response.status === 409) {
          // if username exists, do nothing
          return;
        } else {
          alert("Server error.")
        }
      }
    } catch (error) {
      console.error("Error changing username:", error);
    }
  }

  const editEmail = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('email');
    try {
      const response = await fetch(`/api/users/update-email/${value}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      })
      if (response.ok) {
          setAuth({...auth, email: value})
      }
      else {
        alert("Server error.")
      }
    } catch (error) {
      console.error("Error changing email adress:", error);
    }

  }

  const editL1 = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('l1');
    try {
      const response = await fetch(`/api/users/update-l1/${value}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      });
      if (response.ok) {
        setL1(getLangObject(value));
      }
    } catch (error) {
      console.error("Error changing L1:", error)
    }
  }

  const editPassword = async (e) => {
    e.preventDefault();
    const formData = new FormData (e.target);
    const oldPassword = formData.get('current');
    const newPassword = formData.get('new');
    try {
      const response = await fetch(`/api/users/update-pw/${oldPassword}/${newPassword}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        }
      })

      if (!response.ok) {
        setValidPassword(false);
        alert("Error: changing password failed.")
      }
    } catch (error) {
      console.error("Error changing password:", error)
    }
  }

  const deleteResults = async () => {
    try {
      const response = await fetch(`/api/users/delete-results`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      })
      if (response.ok) {setResultsDeleted(true)};
    } catch (error) {
      console.error("Error deleting results:", error)
    }
  }

  const deleteAccount = async () => {
    try {
      const response = await fetch(`/api/users/delete-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      });
      if (response.ok) {
        setAuth({});
        localStorage.removeItem("token");
        nav("/");
      }
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  useEffect(() => {
    if (auth?.email && l1) {
      const items = [
        {
          label: "Username",
          value: auth?.username,
          edit: editUsername,
          active: changeUsername,
          setActive: setChangeUsername,
          component: <ChangeUsername classes={textFieldClasses} setValidUsername={setValidUsername}/>,
          valid: validUsername,
        },
        {
          label: "Email",
          value: auth?.email,
          edit: editEmail,
          active: changeEmail,
          setActive: setChangeEmail,
          component: <ChangeEmail classes={textFieldClasses} setValidEmail={setValidEmail}/>,
          valid: validEmail,
        },
        {
          label: "Instruction Language",
          value: l1.name,
          edit: editL1,
          active: changeL1,
          setActive: setChangeL1,
          component: <ChangeL1 languages={languages} l1={l1}/>,
          valid: true,
        },
        {
          label: "Password",
          value: "••••••••",
          edit: editPassword,
          active: changePw,
          setActive: setChangePw,
          component: <ChangePassword setValidPassword={setValidPassword} classes={textFieldClasses}/>,
          valid: validPassword,
        }
      ]
      setItems(items);
    }
  }, [auth, l1, changeUsername, changeEmail, changeL1, changePw, validUsername, validEmail, validPassword])

  if (!auth?.email || !l1 || !items) return <div></div>;

  return (
    <Layout>
      <Container maxWidth="sm" className="self-center h-2/3">
        <Paper className={`text-gray-600 gap-5 flex flex-col p-5`}>


          <p className={`font-bold text-lg`}>{t('Settings')}</p>


          <List className={`overflow-y-auto`}>
            {
              items && items.map((item, idx) => {
                return (

                  <ListItem key={idx} className="flex flex-row items-start gap-4" >

                    {/* Label column */}
                    <ListItemText className={`flex-[1.5]`}>
                      {t(item.label)}
                    </ListItemText>



                    {
                      !item.active && item ? 

                      // START: rows in column 2 and 3 when not editing
                      <div className="flex-[3] flex flex-row justify-between items-center">

                        {/* Value column */}
                        <span>
                          {item.value}
                        </span>


                        {/* Button column */}
                        <Button 
                        className={`flex-none px-1 bg-pygblue text-white rounded whitespace-nowrap gap-1 flex items-center justify-center flex-row py-1.5 hover:bg-blue-700`}
                        onClick={() => {item.setActive(true);}}>

                          <p className="font-semibold text-sm">{t('EDIT')}</p>
                          
                          <EditIcon fontSize="small"/>

                        </Button>

                      </div> :
                      // END


                      // START: rows in column 2 and 3 when editing
                      <form className="flex-[3] flex flex-row justify-between items-center gap-10" id={`form-${idx}`} onSubmit={item.edit}>
                        
                        {/* Input column */}
                        {item.component}


                        {/* Button column */}
                        <Button
                        className={`flex-none px-1 bg-green-400 rounded text-white whitespace-nowrap gap-1 items-center flex justify-center flex-row py-1.5 hover:bg-green-700
                          ${!item.valid && "opacity-50"}`}
                        type="submit"
                        form={`form-${idx}`}
                        onClick={() => {
                          item.setActive(false);
                        }}
                        disabled={!item.valid}
                        >

                          <p className={`font-semibold text-sm`}>{t('UPDATE')}</p>

                          <CheckIcon fontSize="small"/>

                        </Button>
                      </form>
                    }
              
                  </ListItem>
                )
              }
              )
            }
          </List>


          <Divider/>


          {/* DELETE BUTTONS */}
          <Box className={`flex justify-between gap-3 `}>



            {/* DELETE RESULTS BUTTON AND DIALOG */}
            <Button className={`${buttonClasses}`} onClick={() => setOpenDeleteResults(true)} startIcon={<DeleteIcon/>}>{t('DELETE RESULTS')}</Button>
            <Dialog 
              onClose={handleClose}
              aria-labelledby="delete-account-dialog"
              open={openDeleteResults}>
                <DialogTitle id="delete-account-dialog-title" className="flex flex-row justify-between"> 
                  <p className="font-bold">{t('DELETE RESULTS')}</p> 
                  <IconButton onClick={handleClose} className="hover:bg-gray-50 text-gray-500"> <CloseIcon/> </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  <p>
                    {
                      resultsDeleted ? 
                      t("Results successfully deleted."):
                      t("Are you sure you want to delete your results? All of your progress will be removed. This action cannot be undone.")
                    }
                  </p>
                </DialogContent>
                <DialogActions className="px-6 pb-4">
                  <Button className={`text-red-700 p-1 px-2 font-semibold text-sm hover:bg-gray-50 ${resultsDeleted && "hidden"}`} onClick={deleteResults}>
                    {t('CONFIRM')}
                  </Button>
                </DialogActions>
            </Dialog>
          

            {/* DELETE ACCOUNT BUTTON AND DIALOG */}
            <Button className={`${buttonClasses}`} onClick={() => setOpenDeleteAccount(true)} startIcon={<DeleteIcon/>}>{t('DELETE ACCOUNT')}</Button>
            <Dialog 
              onClose={handleClose}
              aria-labelledby="delete-account-dialog"
              open={openDeleteAccount}>
                <DialogTitle id="delete-account-dialog-title" className="flex flex-row justify-between"> 
                  <p className="font-bold">{t('DELETE ACCOUNT')}</p> 
                  <IconButton onClick={handleClose} className="hover:bg-gray-50 text-gray-500"> <CloseIcon/> </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                  <p>
                    {t('Are you sure you want to permanently delete your account? All of your progress will be removed. This action cannot be undone.')}
                  </p>
                </DialogContent>
                <DialogActions className="px-6 pb-4">
                  <Button className={`text-red-700 p-1 px-2 font-semibold text-sm hover:bg-gray-50`} onClick={deleteAccount}>
                    {t('CONFIRM')}
                  </Button>
                </DialogActions>
            </Dialog>
          </Box>
        </Paper>
      </Container>
    </Layout>
  )
}