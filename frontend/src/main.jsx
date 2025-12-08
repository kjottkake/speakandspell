import ReactDOM from 'react-dom/client';
import {StrictMode} from 'react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { StyledEngineProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
     <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <App/>
    </StyledEngineProvider>
  </StrictMode>,
)

reportWebVitals();
