// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css' 
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './context/AuthContext.jsx';
// 1. Import BrowserRouter
import { BrowserRouter } from 'react-router-dom';

 ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap everything inside BrowserRouter */}
    <BrowserRouter>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Notifications position="top-right" />
        <AuthProvider>
          <App />         
        </AuthProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>,
);