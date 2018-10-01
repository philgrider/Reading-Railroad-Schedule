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

$('#add-train').on('click', function(event) {
    // Don't refresh the page!
    event.preventDefault();
    var $trainName = $("#new-train-name");
    var $destination = $("#new-desitnation");
    var $firstTrain = $("#new-start-time");
    var $frequency = $("#new-frequency");
    console.log(parseInt($firstTrain.val()));
    
   if($trainName.val() === '' || $destination.val() === '' ||
       isNaN(parseInt($firstTrain.val())) || isNaN(parseInt($frequency.val()))){
            // Modal Popup
            swal({
                type: 'error',
                title: 'Oops...',
                text: 'You need to enter something in all the fields!',
              });
        }else{
                nameStore.eName = $trainName.val().trim();
                nameStore.eDestination = $destination.val();
                nameStore.eFirstTrain = $firstTrain.val().trim();
                nameStore.eFrequency = $frequency.val();

                database.ref().push({
                    trainName: nameStore.eName,
                    destination: nameStore.eDestination,
                    firstTrainTime: nameStore.eFirstTrain,
                frequency : nameStore.eFrequency
                    });
                $trainName.val('');
                $destination.val('');
                $firstTrain.val('');
                $frequency.val('');
                refreshTrains();
        }
});
function refreshTrains() {
    var trainTrackingArea = $('#train-tracking-area');      

    database.ref().orderByChild('trainName').on("value", function (snapshot) {
        trainTrackingArea.empty();
        snapshot.forEach(function(childSnapshot){
            // store snapshot value in records
            var records = childSnapshot.val();
            // create the DOM refrences
            var tableRow = $('<tr>');
            var newRecord = $('<th>').attr('scope', 'row').text(records.trainName);
            var newDestination = $('<td>').text(records.destination);
            var newFrequency = $('<td>').addClass('text-center').text(records.frequency);
            // First time Format variable
            var firstTrainTimeConvereted = moment(records.firstTrainTime, 'HH:mm').subtract(1, 'years');
            //Differents from Current time.
            var diffTime = moment().diff(moment(firstTrainTimeConvereted), 'minutes');
            // Time appart 
            var tRemainingTime = diffTime % records.frequency;
            var minTillTrain = records.frequency - tRemainingTime;
            //Build arival and Min away table
            var nextArrival = $('<td>').addClass('text-center').text(moment(moment().add(minTillTrain, 'minutes'), 'h:mm').format('h:mm A'));
            var newMinAway = $('<td>').addClass('text-center').text(minTillTrain);
            var newRemoveBtn = $('<button>').attr({
                                class: 'btn btn-danger text-center',
                                'id':'remove-train',
                                'data-name': childSnapshot.key
            }).html('<i class="far fa-trash-alt"></i>');
    
            tableRow.append(newRecord, newDestination, newFrequency, nextArrival, newMinAway,newRemoveBtn);
            trainTrackingArea.append(tableRow);
        });


      }, function (errorObject) {
        console.log('The read failed: ' + errorObject.code);
      });

  };
$('#train-tracking-area').on('click','button', function(){
    // create a reference to the database
    var databaseRef = database.ref();
    var $trainRefElm = $(this).attr('data-name');
    // modal Popup
    const swalWithBootstrapButtons = swal.mixin({
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
      });
      swalWithBootstrapButtons({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          swalWithBootstrapButtons(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
          databaseRef.once("value")
          .then(function(snapshot) {
              console.log(snapshot); 
              databaseRef.child($trainRefElm).remove(); 
          });
        } else if (
          // Read more about handling dismissals
          result.dismiss === swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons(
            'Cancelled',
            'Your train schedule is safe :)',
            'error'
          )
        }
      });
});
  // initial DOM update
  refreshTrains();
  setInterval(refreshTrains, 60000);
