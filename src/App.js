import React from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskList from './components/Tasklist';
import CalendarView from './components/CalendarView';
import WidgetSection from './components/WidgetSection';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="content">
        <Sidebar />
        <div className="main-content">
          <TaskList />
          <CalendarView />
          <WidgetSection />
        </div>
      </div>
    </div>
  );
}

export default App;