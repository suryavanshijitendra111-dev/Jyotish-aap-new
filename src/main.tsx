import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { I18nProvider } from './i18n';
import { ProfileProvider } from './context/ProfileContext';
import { GuardianErrorBoundary } from './components/guardian/GuardianErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <ProfileProvider>
        <GuardianErrorBoundary moduleName="RootApp">
          <App />
        </GuardianErrorBoundary>
      </ProfileProvider>
    </I18nProvider>
  </StrictMode>,
);
