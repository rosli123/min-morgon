import React, { useState, useEffect } from 'react';
import { testTrains } from './trainData';

function App() {
  const [time, setTime] = useState(new Date());
  const [progress, setProgress] = useState(0); // Sunrise progress (0-100)
  const [temp, setTemp] = useState(null); // Temperature
  const [trains, setTrains] = useState([]);

  useEffect(() => {

    fetchTemperature();
    setTrains(testTrains); // Using test data for trains
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
    }, 600); // Every 600ms (every half a second)

    
    // Cleanup function - Stop the timer after the sunrise 
    return function cleanup() {
      clearInterval(timeInterval);
      clearInterval(sunriseInterval);
    };
  }, []);  

  // Format the time
  const timeString = time.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  });

// Choose background color
//-----------------------------

let chosenColor;
// progress changes to colors
// Count the RGB values separately - dark start colour
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

let sunIntensity = progress / 150; // how strong the sun is

// Draw the background
const backgroundStyle = {
  backgroundColor: chosenColor, // light blue
  backgroundImage: "linear-gradient(to top, rgba(253, 184, 19, " + sunIntensity + "), transparent)", // the sun tones in, the yellow color is transparent at the top 
  transition: "all 1s linear" // soft transition
};
//-----------------------------------------------------


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
            temp: tempParameter.values[0]
          });
    });
  };
// -------------------------------------------------------------
  
  // Transport advice 
  let transportAdvice = "";

  if (temp && temp.temp !== undefined){
    if (temp.temp <= 0){
      transportAdvice = "Det är kallt och halt ute, bussen rekommenderas till stationen!"
    }
    else if (temp.temp > 0 && temp.temp < 10) {
      transportAdvice = "Perfekt väder för att cykla till stationen!"
    }
    else {
      transportAdvice = "Det är fint väder ute, ta en promenad om du inte har bråttom till centralen!"
    }
  }
// -------------------------------------------------------------
  
// Filtering trains to stockholm 
  const stockholmTrains = trains
    .filter(train => train.to === "Stockholm C") 
    .filter(train => new Date(train.departure) > time) // Trains in the future
    .sort((a, b) => new Date(a.departure) - new Date(b.departure)) // Furthest first
    .slice(0, 3); // Show only three trains

 
  const formattedTrains = stockholmTrains.map((train) => {
  const depDate = new Date(train.departure);
  
  // Time
  const displayTime = depDate.toLocaleTimeString('sv-SE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Date
  let dateLabel = "";

  if (depDate.toDateString() === time.toDateString()) {
    dateLabel = "Idag";
  } else {
    dateLabel = depDate.toLocaleDateString('sv-SE', { 
      day: 'numeric', 
      month: 'short' 
    });
  }


  return {
    ...train, // "Spread operator" to copy all properties from the train object
    displayTime: displayTime,
    dateLabel: dateLabel
  };
});
  
// -------------------------------------------------------------

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

      {/* Frozen glass */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-2xl">
        <h1 className="text-2xl font-light mb-2">Godmorgon</h1>
        <p className="text-sm opacity-90 font-light leading-relaxed mb-4">
          {transportAdvice}
        </p>

      
      {/* Train information */}
      <div className="pt-4 border-t border-white/10 mt-4">
        <h3 className="text-[14px] uppercase tracking-widest opacity-50 mb-3">Nästa tåg till Stockholm</h3>

        {formattedTrains.length > 0 ? (
          formattedTrains.map((train, index) => (
            <div key={index} className="flex justify-between items-center mb-3 last:mb-0">
              <div>
                <span className="text-xs opacity-50 block">{train.dateLabel}</span>
                <span className="text-xl font-light">{train.displayTime}</span>
              </div>
              <div className="text-right">
                <span className="text-xs opacity-50 block">Spår</span>
                <span className="text-lg font-medium">{train.track}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs opacity-50 italic">Inga fler tåg hittades...</p>
        )}
      </div>
    </div>
    </div>
  );
}


export default App;