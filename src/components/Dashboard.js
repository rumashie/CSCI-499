import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header'; 
import Sidebar from './Sidebar'; 
import TaskList from './Tasklist'; 
import CalendarView from './CalendarView'; 
import WidgetSection from './WidgetSection'; 
import StudyMode from './StudyMode'; 
import WeatherWidget from './WeatherWidget';
import EmailSummarizer from './EmailSummarizer';
import './Dashboard.css'


const Dashboard = () => {
  const isAuthenticated = localStorage.getItem('authenticated') === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (

      <div className="app">
        <Header />
        <div className="content">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="productivity" element={<StudyMode />} />
              <Route path="collaborators" element={<EmailSummarizer />} />
              <Route path="/" element={
                <>
                  <TaskList />
                  <CalendarView />
                  <WidgetSection />
                  <WeatherWidget />
                </>
              } />
            </Routes>
          </div>
        </div>
      </div>
    
  );
};

export default Dashboard;
