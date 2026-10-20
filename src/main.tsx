import React from 'react';
import ReactDOM from 'react-dom/client';
import SpartakApp from './App';
import '@fontsource-variable/montserrat';
import './base.css';
import './spartak.css';

const root = document.getElementById('root')!;
const app = <React.StrictMode><SpartakApp /></React.StrictMode>;
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app);
else ReactDOM.createRoot(root).render(app);
