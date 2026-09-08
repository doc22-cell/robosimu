/* =========================================
   GLOBAL
========================================= */

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  font-family: Arial, Helvetica, sans-serif;
  background: #f5f7fb;
  color: #334155;
}

body {
  overflow-x: hidden;
}

button,
select,
input {
  font-family: inherit;
}


/* =========================================
   MAIN APP
========================================= */

.app {
  display: flex;
  min-height: 100vh;
  background: #f5f7fb;
}


/* =========================================
   SIDEBAR
========================================= */

.sidebar {
  width: 350px;
  min-width: 350px;
  min-height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 38px 22px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 5px 18px 45px;
}

.logo:first-child {
  font-size: 40px;
}

.logo div {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.logo strong {
  font-size: 21px;
  color: #0f172a;
  white-space: nowrap;
}

.logo span {
  font-size: 15px;
  color: #7890b0;
  white-space: nowrap;
}


/* =========================================
   SIDEBAR NAVIGATION
========================================= */

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar nav button {
  width: 100%;
  height: 62px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #526987;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 25px;
  font-size: 17px;
  text-align: left;
  cursor: pointer;
}

.sidebar nav button span {
  font-size: 17px;
}

.sidebar nav button:hover {
  background: #f5f8ff;
}

.sidebar nav button.active {
  background: #eaf1ff;
  color: #155eef;
}


/* =========================================
   MAIN AREA
========================================= */

.main {
  flex: 1;
  min-width: 0;
  padding: 42px 42px 25px;
}


/* =========================================
   HEADER
========================================= */

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 34px;
}

.header h1 {
  margin: 0 0 12px;
  font-size: 29px;
  font-weight: 700;
  color: #0f172a;
}

.header p {
  margin: 0;
  font-size: 18px;
  color: #7185a2;
}

.connection {
  min-width: 145px;
  height: 62px;
  padding: 0 20px;
  border: 1px solid #ccefdc;
  border-radius: 10px;
  background: #f3fcf6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #16a05d;
  font-size: 17px;
}

.dot {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
}


/* =========================================
   CONTENT
========================================= */

.content {
  display: grid;
  grid-template-columns: minmax(500px, 1.35fr) minmax(430px, 0.95fr);
  gap: 26px;
  align-items: start;
}


/* =========================================
   CARD
========================================= */

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}


/* =========================================
   CARD HEADER
========================================= */

.card-header {
  height: 76px;
  padding: 0 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8edf4;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #64748b;
  font-weight: 600;
}

.card-header button {
  border: none;
  background: transparent;
  color: #7185a2;
  font-size: 22px;
  cursor: pointer;
}


/* =========================================
   3D ENVIRONMENT
========================================= */

.environment {
  min-height: 650px;
}

.canvas-container {
  height: 575px;
  width: 100%;
  background: #f8fafc;
}

.canvas-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}


/* =========================================
   CONTROLS
========================================= */

.controls {
  min-height: 650px;
}

.controls .card-header select {
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d7e0eb;
  border-radius: 9px;
  background: #ffffff;
  color: #475569;
  font-size: 16px;
}


/* =========================================
   CONTROL SECTIONS
========================================= */

.control-section {
  padding: 31px 25px;
  border-bottom: 1px solid #e8edf4;
}

.control-section h3 {
  margin: 0 0 25px;
  text-align: center;
  font-size: 17px;
  color: #536783;
  font-weight: 600;
}


/* =========================================
   BUTTON GRID
========================================= */

.button-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.button-grid button {
  height: 60px;
  min-width: 0;
  border: 1px solid #dbe3ed;
  border-radius: 9px;
  background: #ffffff;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s ease;
}

.button-grid button:hover {
  background: #f8fafc;
  border-color: #b9c7d9;
}

.button-grid button:active {
  transform: scale(0.97);
}


/* =========================================
   CARTESIAN COLORS
========================================= */

.button-grid .x {
  color: #ef4444;
}

.button-grid .y {
  color: #16a34a;
}

.button-grid .z {
  color: #2563eb;
}


/* =========================================
   ROTATIONAL COLORS
========================================= */

.button-grid .rx,
.button-grid .ry,
.button-grid .rz {
  color: #8b5cf6;
}


/* =========================================
   JOINT BUTTONS
   SAME 6-COLUMN OLD UI
========================================= */

.joint-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.joint-grid button {
  height: 60px;
  border: 1px solid #dbe3ed;
  border-radius: 9px;
  background: #ffffff;
  color: #2563eb;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
}

.joint-grid button:hover {
  background: #f8fafc;
  border-color: #b9c7d9;
}

.joint-grid button:active {
  transform: scale(0.97);
}


/* =========================================
   SETTINGS ROW
========================================= */

.settings-row {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 30px;
  padding: 30px 25px;
}

.settings-row > div {
  min-width: 0;
}

.settings-row label {
  display: block;
  margin-bottom: 14px;
  text-align: center;
  color: #64748b;
  font-size: 16px;
}

.settings-row select {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #d7e0eb;
  border-radius: 9px;
  background: #ffffff;
  color: #475569;
  font-size: 16px;
}


/* =========================================
   SPEED
========================================= */

.speed {
  position: relative;
}

.speed input[type="range"] {
  width: 100%;
  margin: 8px 0 0;
  accent-color: #93c5fd;
  cursor: pointer;
}

.speed span {
  display: block;
  text-align: right;
  margin-top: -5px;
  color: #64748b;
  font-size: 14px;
}


/* =========================================
   CURRENT POSE
========================================= */

.pose {
  margin-top: 26px;
  padding: 27px 25px 30px;
}

.pose h2 {
  margin: 0 0 25px;
  font-size: 20px;
  color: #536783;
}

.pose-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
}

.pose-grid > div {
  min-height: 105px;
  border: 1px solid #e0e7ef;
  border-radius: 10px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.pose-grid span {
  color: #7185a2;
  font-size: 15px;
}

.pose-grid strong {
  color: #334155;
  font-size: 20px;
}

.pose-grid small {
  color: #94a3b8;
  font-size: 13px;
}


/* =========================================
   FOOTER
========================================= */

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 5px 0;
  color: #64748b;
  font-size: 14px;
}

footer strong {
  color: #334155;
}

footer .ros {
  color: #16a05d;
}


/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1250px) {

  .sidebar {
    width: 280px;
    min-width: 280px;
  }

  .main {
    padding: 30px;
  }

  .content {
    grid-template-columns: 1fr;
  }

  .pose-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}


@media (max-width: 800px) {

  .app {
    display: block;
  }

  .sidebar {
    width: 100%;
    min-width: 0;
    min-height: auto;
    padding: 20px;
  }

  .logo {
    padding-bottom: 20px;
  }

  .sidebar nav {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .main {
    padding: 20px;
  }

  .header {
    gap: 20px;
    flex-direction: column;
  }

  .button-grid,
  .joint-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .settings-row {
    grid-template-columns: 1fr;
  }

  .pose-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
/* =========================
   JOINT JOG BUTTON FIX
========================= */

.button-grid .joint {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 42px;

  padding: 10px 14px;

  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;

  background: #1f2937 !important;

  border: 1px solid #374151 !important;
  border-radius: 8px;

  font-size: 14px;
  font-weight: 600;
  line-height: 1;

  opacity: 1 !important;
  visibility: visible !important;

  cursor: pointer;
}

.button-grid .joint:hover {
  background: #374151 !important;
}

.button-grid .joint:active {
  background: #4b5563 !important;
  transform: translateY(1px);
}