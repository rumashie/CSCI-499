import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//imported library to use kind of like bootstrap but for react notifcations https://github.com/fkhadra/react-toastify
function takeBreak() {
  console.log("Taking a 5-minute break...");
  toast.info("It's time to take a break!", {
    autoClose: 5000, //goes away after 5 seconds
    pauseOnHover: false // don't pause the timer when hovering over the notification
  });
  setTimeout(() => {
    console.log("Break's over. Time to work!");
    remindToTakeBreak(); 
  }, 300000); //  5 minutes
}


function remindToTakeBreak() {
  console.log("It's time to work now!");
  setTimeout(() => {
    takeBreak();
  }, 3600000); // 3,600,000 milliseconds = 1 hour
}


function App() {
  
  useEffect(() => {
    remindToTakeBreak();
  }, []);

  return (
    <div>
      { }
      <ToastContainer />
    </div>
  );
}

export default App;
