// don't forget about the Document Ready



var nameStore = {
    eName: '',
    eDestination: '',
    eFirstTrain: '',
    eFrequency: ''
}

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCtHdTDOTF3Xx_eaWvxXlH1IclDeLgj6H8",
    authDomain: "train-tracking-database.firebaseapp.com",
    databaseURL: "https://train-tracking-database.firebaseio.com",
    projectId: "train-tracking-database",
    storageBucket: "train-tracking-database.appspot.com",
    messagingSenderId: "989970759154"
  };
  firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

$("#add-train").on("click", function(event) {
    // Don't refresh the page!
    event.preventDefault();

    nameStore.eName = $("#new-train-name").val().trim();
    nameStore.eDestination = $("#new-desitnation").val();
    nameStore.eFirstTrain = $("#new-start-time").val().trim();
    nameStore.eFrequency = $("#new-frequency").val();

    database.ref().push({
      trainName: nameStore.eName,
      destination: nameStore.eDestination,
      firstTrainTime: nameStore.eFirstTrain,
      frequency : nameStore.eFrequency
    });
    refreshTrains();
});
// update schedule as trains are added
// database.ref().on("child_added", function updateTrains(snapshot) {
//     refreshTrains();
    
// });
function refreshTrains() {
    var trainTrackingArea = $('#train-tracking-area');
    
    trainTrackingArea.empty();       

    database.ref().on("value", function (snapshot) {
        console.log(snapshot.val());
        snapshot.forEach(function(childSnapshot){
            var records = childSnapshot.val();
            console.log(records);

            var tableRow = $('<tr>');
            var newRecord = $('<th>').attr('scope', 'row').text(records.trainName);
            var newDestination = $('<td>').text(records.destination);
            var newFrequency = $('<td>').text(records.frequency);
            // First time Format variable
            var firstTrainTimeConvereted = moment(records.firstTrainTime, 'HH:mm').subtract(1, 'years');
            console.log('time stored ', records.firstTrainTime);
            console.log(firstTrainTimeConvereted);
            //Differents from Current time.
            var diffTime = moment().diff(moment(firstTrainTimeConvereted), 'minutes');
            console.log(diffTime);
            // Time appart 
            var tRemainingTime = diffTime % records.frequency;
            var minTillTrain = records.frequency - tRemainingTime;
            var nextArrival = $('<td>').text(moment(moment().add(minTillTrain, 'minutes'), 'h:mm').format('h:mm A'));
            var newMinAway = $('<td>').text(minTillTrain);
    
            tableRow.append(newRecord, newDestination, newFrequency, nextArrival, newMinAway);
            trainTrackingArea.append(tableRow);
        });


      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });





  };
  // initial DOM update
  refreshTrains();
  setInterval(refreshTrains, 60000);
