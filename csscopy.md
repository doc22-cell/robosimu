* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  background: #f6f8fb;
  color: #172033;
}

button,
select,
input {
  font-family: inherit;
}

.app {
  min-height: 100vh;
  display: flex;
}

/* SIDEBAR */

.sidebar {
  width: 230px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 22px 15px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin-bottom: 30px;
}

.logo:first-child {
  font-size: 27px;
}

.logo strong {
  display: block;
  font-size: 14px;
}

.logo span {
  display: block;
  color: #8a94a6;
  font-size: 10px;
  margin-top: 3px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

nav button {
  border: 0;
  background: transparent;
  padding: 13px 15px;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  color: #687386;
  font-size: 14px;
}

nav button span {
  margin-left: 10px;
}

nav button:hover,
nav button.active {
  background: #eef4ff;
  color: #2563eb;
}

/* MAIN */

.main {
  flex: 1;
  padding: 24px 30px;
  min-width: 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.header p {
  margin: 5px 0 0;
  color: #8992a3;
  font-size: 13px;
}

.connection {
  background: #effaf3;
  color: #22a05a;
  border: 1px solid #d5f0df;
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 12px;
}

.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  background: #22c55e;
  border-radius: 50%;
  margin-right: 7px;
}

/* CARDS */

.card {
  background: white;
  border: 1px solid #e5e9ef;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.content {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(350px, 0.8fr);
  gap: 18px;
}

.card-header {
  height: 55px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #edf0f4;
}

.card-header h2,
.pose h2 {
  font-size: 15px;
  margin: 0;
}

.card-header button {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #8a94a6;
}

.card-header select,
.settings-row select {
  border: 1px solid #dfe4eb;
  background: white;
  padding: 7px 10px;
  border-radius: 6px;
  color: #555f70;
}

/* 3D */

.canvas-container {
  height: 510px;
  background: #f8fafc;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

.canvas-container canvas {
  width: 100% !important;
  height: 100% !important;
}

/* CONTROLS */

.controls {
  overflow: hidden;
}

.control-section {
  padding: 18px;
  border-bottom: 1px solid #edf0f4;
}

.control-section h3 {
  font-size: 12px;
  color: #697386;
  margin: 0 0 12px;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 7px;
}

.button-grid button {
  height: 42px;
  border: 1px solid #e2e6ec;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.button-grid button:hover {
  background: #f5f7fa;
}

.x {
  color: #ef4444;
}

.y {
  color: #22a05a;
}

.z {
  color: #2563eb;
}

.rx,
.ry,
.rz {
  color: #8b5cf6;
}

/* SETTINGS */

.settings-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 20px;
  padding: 18px;
}

.settings-row label {
  display: block;
  font-size: 11px;
  color: #697386;
  margin-bottom: 7px;
}

.settings-row select {
  width: 100%;
}

.speed {
  position: relative;
}

.speed input {
  width: 100%;
}

.speed span {
  position: absolute;
  right: 0;
  top: 25px;
  font-size: 11px;
  color: #697386;
}

/* POSE */

.pose {
  margin-top: 18px;
  padding: 18px;
}

.pose-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-top: 16px;
  gap: 12px;
}

.pose-grid div {
  background: #f8fafc;
  border-radius: 7px;
  padding: 12px;
}

.pose-grid span,
.pose-grid small {
  display: block;
  color: #8992a3;
  font-size: 10px;
}

.pose-grid strong {
  display: inline-block;
  margin: 6px 4px 0 0;
  font-size: 15px;
}

/* FOOTER */

footer {
  display: flex;
  justify-content: space-between;
  padding: 15px 3px;
  color: #8992a3;
  font-size: 11px;
}

footer strong {
  color: #22a05a;
}

.ros {
  color: #22a05a;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .content {
    grid-template-columns: 1fr;
  }

  .pose-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 700px) {
  .sidebar {
    width: 70px;
  }

  .logo div,
  nav button span {
    display: none;
  }

  .main {
    padding: 15px;
  }

  .button-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
/* =========================
   JOINT JOG BUTTONS
   ========================= */

.controls .button-grid button {
  min-height: 56px;
  min-width: 60px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 16px;
  font-weight: 600;

  background: #ffffff;

  border: 1px solid #dbe3ef;

  border-radius: 8px;

  cursor: pointer;

  transition: 0.2s;
}

/* Hover */

.controls .button-grid button:hover {
  background: #f1f5ff;
  border-color: #2563eb;
}

/* Joint buttons */

.controls .button-grid .j1,
.controls .button-grid .j2,
.controls .button-grid .j3,
.controls .button-grid .j4,
.controls .button-grid .j5,
.controls .button-grid .j6 {
  color: #2563eb;
}

/* Pressed effect */

.controls .button-grid button:active {
  transform: scale(0.96);
}