import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App/App';
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

const msalConfig = {
  auth: {
    clientId: "2a8e75fd-a443-44fc-9244-7dc6c5caba3e",
    authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
    redirectUri: "https://barilantimlul.eladtest.com",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          console.log(message);
        }
      },
      logLevel: LogLevel.Error,
      piiLoggingEnabled: false,
    },
    navigateToLoginRequestUrl: false,
  },
};

// Create the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);


// Function to initialize MSAL and render the app
const initializeApp = async () => {
  try {
    // Ensure MSAL is fully initialized
    await msalInstance.initialize();
    //console.log("MSAL initialized successfully.");

    // Render the app after successful initialization
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to initialize MSAL:", error);
  }
};

initializeApp();

