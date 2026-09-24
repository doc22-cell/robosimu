import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { calculateFK } from "./kinematics/forwardKinematics";
import "./kinematics/testMOVL";
import "./kinematics/testIK";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
