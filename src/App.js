import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskList from './components/Tasklist';
import CalendarView from './components/CalendarView';
import WidgetSection from './components/WidgetSection';
import StudyMode from './components/StudyMode'; 

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="content">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/StudyMode" element={<StudyMode />} /> {/* need to host this  */}
              <Route path="/" element={
                <>
                  <TaskList />
                  <CalendarView />
                  <WidgetSection />
                </>
              } />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
