
var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

var devkey = '152bad627503b0fde327a2bc7719194a';

function getCash(key) {
  //URL for api call
  var url = 'http://api.reimaginebanking.com/accounts/55e94a6bf8d8770528e6153f/?key=' + key;
  xhrRequest(url, 'GET', 
    function(responseText){
      console.log(responseText);
      var json = JSON.parse(responseText);
      
      var balance = json.balance + '.00';
      console.log('Balance is ' + balance);
      
      //send the cash balance to the pebble
      Pebble.sendAppMessage({KEY_ACCOUNT_BAL: balance }, 
        function(e) {
          console.log('Cash info sent to Pebble successfully!');
        },
        function(e) {
          console.log('Error sending cash info to Pebble!');
        }
      );
    }
  );
}

function locationSuccess(pos) {
  // Construct URL
  var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
      pos.coords.latitude + '&lon=' + pos.coords.longitude;

  // Send request to OpenWeatherMap
  xhrRequest(url, 'GET', 
    function(responseText) {
      console.log(responseText);
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);

      // Temperature in Kelvin requires adjustment
      var temperature = Math.round(json.main.temp - 273.15);
      console.log('Temperature is ' + temperature);

      // Conditions
      var conditions = json.weather[0].main;      
      console.log('Conditions are ' + conditions);
    
      // Assemble dictionary using our keys
      var dictionary = {
        'KEY_TEMPERATURE': temperature,
        'KEY_CONDITIONS': conditions
      };
      
      // Send message to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log('Weather info sent to Pebble successfully!');
        },
        function(e) {
          console.log('Error sending weather info to Pebble!');
        }
      ); //end Pebble.sendAppMessage
    }
  );
}


function locationError(err) {
  console.log('Error requesting location!');
}

//sets up the getWeather call, locationSuccess is where all the work is with the call and sending data to the Pebble
function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}

//Interactions with the Pebble watch
// Listen for when an AppMessage is received from the Pebble
Pebble.addEventListener('appmessage',
  function(e) {
    console.log('AppMessage received!');
    getWeather();
    getCash(devkey);
  }                     
);

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log('PebbleKit JS ready!');

    // Get the initial weather
    getWeather();
    getCash(devkey);
  }
);
