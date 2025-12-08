import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import CircularProgress from '@mui/material/CircularProgress';

export default function ExerciseList({exercises, type, handleSelectExercise, hideProgress, results, loading}) {

  if (loading) {
    return (<CircularProgress/>)
  }
  return (
    <List dense className={`scroll-smooth size-full overflow-y-auto`}>
      {
        exercises.map((ex, idx) => {
          const exID = ex.id;
          const progress = results?.[type]?.[exID] * 100 || 0;
          return (
            <ListItem className='flex items-center justify-center' key={idx}>

              <Link to={`/exercise/${ex.id}`}  className='w-full'> {/* navigates to the exercise page when an exercise is clicked. Assumes ex.sound is unique */}

                <ListItemButton 
                className={`${hideProgress ? "rounded-md" : "rounded-t-md"} text-center bg-pygblue`}
                onClick={() => {handleSelectExercise(type,ex)}}>

                  <ListItemText className='text-white'>
                    <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(ex.target)}}/>
                  </ListItemText>

                </ListItemButton>


                <LinearProgress 
                  value={progress} 
                  variant='determinate'
                  color='success'
                  className={`w-full rounded-b-md ${hideProgress ? "hidden": ""}`}
                  />

              </Link>
              
            </ListItem>
          )
        })
      }
    </List>
    
  );
}