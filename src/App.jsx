import React, { useState, useEffect } from 'react';

function App() {
  const [time, setTime] = useState(new Date());
  const [progress, setProgress] = useState(0); // Sunrise progress (0-100)
  const [temp, setTemp] = useState([]); // Temperature
  // const {trains, setTrains} = useState([]);

  useEffect(() => {

    fetchTemperature();
    // Update time every second
    const timeInterval = setInterval(() => {
      setTime(new Date()); 
    }, 1000);

    // Sunrise timer
    const sunriseInterval = setInterval(function(){
      setProgress(function(prev){
        if (prev < 100){
          return prev + 1;
        }
        else{
          return 100
        }
      });
    }, 600);

    // Cleanup function - Stop the timer after the sunrise 
    return function cleanup() {
      clearInterval(timeInterval);
      clearInterval(sunriseInterval);
    };
  }, []);  

  // Formate the time 
  const timeString = time.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  });

// Choose background color
//-----------------------------

let chosenColor;
// Count the RGB values separately 
let red = 20 + progress;
let green = 23 + (progress * 1.5);
let blue = 42 + (progress * 1.8);

if (progress < 100) {
  // Use the counted RGB
  chosenColor = "rgb(" + red + ", " + green + ", " + blue + ")";
} else {
  // When time is 100, use a fixed blue color
  chosenColor = "#bae6fd";
}

let sunIntensity = progress / 150;

const backgroundStyle = {
  backgroundColor: chosenColor,
  backgroundImage: "linear-gradient(to top, rgba(253, 184, 19, " + sunIntensity + "), transparent)", // the sun tones in
  transition: "all 1s linear" // soft transition
};
//-----------------------------


// Temperature API
const fetchTemperature = function() {
  const url = "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/15.6214/lat/58.4108/data.json";

  fetch(url)
    .then(function(response){
      return response.json();
    })
    .then(function(data){
      const latestData = data.timeSeries[0];

      const tempParameter = latestData.parameters.find(function(p){
            return p.name === "t";
          });
          setTemp({ 
            date: latestData.validTime.split("T")[0],
            temp: tempParameter.values[0]
          });
    });
  };

  

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center text-white p-4 transition-colors duration-1000"
      style={backgroundStyle}
    >
      {/* The clock*/}
      <div className="text-center mb-8">
        <h2 className="text-sm uppercase tracking-[0.3em] opacity-60 mb-2">Ny Dag</h2>
        <div className="text-8xl font-extralight tracking-tighter italic">
          {timeString}
        </div>

      {/* Temperature*/}
        <div className="text-center opacity-80">
          {temp && (
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">Just nu i Linköping</span>
              <span className="text-3xl font-light tracking-tight">{temp.temp}°C</span>
            </div>
          )}
        </div>
      </div>

      {/* Kort för info (Frostat glas) */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-2xl">
        <h1 className="text-2xl font-light mb-2">Godmorgon</h1>
        
        
      </div>
      
    </div>
  );
  
}

export default App;