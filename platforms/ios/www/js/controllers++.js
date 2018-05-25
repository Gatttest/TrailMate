angular.module('sctrails.controllers', [])

.controller('MapCtrl', ['$scope', '$rootScope', '$state', '$window', 'leafletData', 'trailLocator', 'GeoJSONLayers', 'TrailCache', 'sharedUtils','$ionicSideMenuDelegate', '$http', '$rootScope',
function($scope, $rootScope, $state, $window, leafletData, trailLocator, GeoJSONLayers, TrailCache, sharedUtils, $ionicSideMenuDelegate, $http,$rootScope) {

    //gps location since last clicking the locate button



    var currentloc;

    console.log(window.localStorage.getItem('teamId'));

if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }


    if(trailLocator.center){
        $scope.center = trailLocator.center;
        trailLocator.center = null;
    }else if($rootScope.center){
        $scope.center = $rootScope.center;
    }else {
        angular.extend($scope, {
            center: {
                lat: 18.54138,
                lng: 73.405275,
                zoom: 11
            }
        });
    }

    angular.extend($scope, {
        tiles: {
            url: 'tiles/{z}/{x}/{y}.png'
            //url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
           // url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
        },
        defaults: {
            attributionControl: false,
            minZoom: 11,
            maxZoom: 15,
            scrollWheelZoom: true,
            zoomControl: true
        },
        events: {
            map: {
                enable: ['moveend',],
                logic: 'emit'
            }
        }
    });

    $scope.$on('leafletDirectiveMap.moveend', function(event){
        leafletData.getMap().then(function(map){
            $rootScope.center = {
                lat: map.getCenter().lat,
                lng: map.getCenter().lng,
                zoom: map.getZoom()
            };
        });

    });

   // Draw all the things
    var colors = ['brown', 'green', '#00b2ff', 'black'];
    var ratings = ['Road', 'easy', 'moderate', 'difficult'];
    var poiIcons = {
        "poi": "ion-flag",
        "shop": "ion-settings",
        "beer": "ion-beer",
        "pump": "ion-happy",
    }
    var layers = new GeoJSONLayers();
    if (!TrailCache.trailData){
        $scope.markers = {};
        
        km=window.localStorage.getItem('km');

        //km=50;

        if(km==50)
        trails=trails50;  

        for(var i = 0; i < trails.length; i++){
            trail = trails[i];
            if(!trail.secret || $window.localStorage['bro'] == 'true'){
                layers.addLayer(trail.name, trail.geojson, trail.rating, trail.open, function(feature){
                    if(feature.properties.rating == 2){
                        dashArray = 0;
                    }
                    if(!feature.properties.open){
                        color = "grey";
                        dashArray = 5;
                    }else {
                        color = colors[feature.properties.rating - 1 ];
                        dashArray = 3;
                    }
                    return {
                        color: color,
                        weight: 7,
                        opacity: 1,
                        dashArray: dashArray
                    };
                });
                if(!trail.hide){
                    if(!trail.open){
                        html = "<p><i class=\"ion-close-circled\"></i> " + trail.name + "</p>";
                    }else{
                        //html = "<p>" + trail.name + "</p>";
                         html = "";
                    }
                   // alert(trail.geojson.features[0].geometry.coordinates[trail.marker.coordinates][0] + trail.marker.offset_lat);
                    marker = {
                        lat: trail.geojson.features[0].geometry.coordinates[trail.marker.coordinates][1] + trail.marker.offset_lat,
                        lng: trail.geojson.features[0].geometry.coordinates[trail.marker.coordinates][0] + trail.marker.offset_lng,
                        type: "trail",
                        icon:{
                            type: 'div',
                            className: '',
                            iconAnchor: [-6,15],
                            popupAnchor:  [30, 0],
                            iconSize: [0, 0],
                            html: html,
                        }
                    };
                    $scope.markers[trail.safe_name] = marker;
                    TrailCache.markers[trail.safe_name] = marker;
                }
            }
        }

        if(km==50)
        points=points50;    


        for (var i = 0; i < points.length; i++){
            point = points[i];
            if(!point.secret || $window.localStorage['bro'] == 'true'){
                marker = {
                    lat: point.geojson.coordinates[0],
                    lng: point.geojson.coordinates[1],
                    type: "poi",
                    icon: {
                        type: 'div',
                        className: 'arrow_box_point arrow_box',
                        iconAnchor: [-6, 15],
                        popupAnchor: [30, 0],
                        iconSize: [25, 25],
                        html: "<p><i class=\"" + poiIcons[point.type] + "\"></i></p>"
                    }
                };
                $scope.markers[point.safe_name] = marker;
                TrailCache.markers[point.safe_name] = marker;
            }
        }



        TrailCache.trailData = layers.get();
        $scope.geojson = TrailCache.trailData;
    } else {
        $scope.geojson = TrailCache.trailData;
        $scope.markers = TrailCache.markers;
    }



    leafletData.getMap().then(function(map) {
            northEast = L.latLng(18.7958,73.5911);
            southWest = L.latLng(18.3910, 73.3049);
            bounds = L.latLngBounds(southWest, northEast);
            map.setMaxBounds(bounds);


            
    });


    

    //This is terrible but ui-sref wont work in the marker html template
    $scope.$on('leafletDirectiveMarker.click', function(e, args){
        for(var i = 0; i < trails.length; i++){
            if(trails[i].safe_name == args.markerName){
                $state.go('tab.trail-detail', {trail: i});
                break;
            }
        }
        for(var i = 0; i < points.length; i++){
            if(points[i].safe_name == args.markerName){
                $state.go('tab.poi-detail', {poi: i});
                break;
            }
        }
    });

    function onSuccess(position) {
        el = document.getElementById("locate-icon");
        el.classList.add("ion-pinpoint");
        el.classList.remove("ion-loading-a");

       //alert("lang:"+position.coords.longitude+" lat:"+position.coords.latitude);
        marker = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            focus: true
        };
        TrailCache.markers["currentloc"] = marker;
        $scope.markers["currentloc"] = marker;

        //for some reason leaflet does not want to add a marker after we've
        //already gotten them from the cache, so we have to manually add
        //the currentloc marker and remove the old one
        leafletData.getMap().then(function(map) {
            if(currentloc !== undefined){
                map.removeLayer(currentloc);
            }
            currentloc = L.marker([marker.lat, marker.lng]);
            currentloc.addTo(map);
            map.panTo([marker.lat, marker.lng]);
        });

    }

    function onError(error) {
        console.log('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');

        alert("Let apps use GPS on your phone to pinpoint your location.Please check your GPS settings");

    }

    function onWait(){
        el = document.getElementById("locate-icon");
        el.classList.remove("ion-pinpoint");
        el.classList.add("ion-loading-a");
        console.log("waiting...");
    }

    $scope.markLocation = function(){
        getAccurateCurrentPosition(onSuccess, onError, onWait);
    };

    $scope.displayMarkers = true;

    $scope.displayFlash =true;

$scope.toggleFlash = function(){
        $scope.displayFlash = !$scope.displayFlash;



window.plugins.flashlight.available(function(isAvailable) {
  if (isAvailable) {


window.plugins.flashlight.toggle(
  function() {}, // optional success callback
  function() {}, // optional error callback
  {intensity: 0.3} // optional as well, used on iOS when switching on
);
    // // switch on
    // window.plugins.flashlight.switchOn(
    //   function() {}, // optional success callback
    //   function() {}, // optional error callback
    //   {intensity: 0.3} // optional as well
    // );

    // // switch off after 3 seconds
    // setTimeout(function() {
    //   window.plugins.flashlight.switchOff(); // success/error callbacks may be passed
    // }, 3000);

  } else {
    alert("Flashlight not available on this device");
  }
});

      
    };



    $scope.toggleMarkers = function(){
        $scope.displayMarkers = !$scope.displayMarkers;
        for(var marker in $scope.markers){
            if(!$scope.displayMarkers){
                $scope.markers[marker].icon.className += " hide";
            }else{
                // I hate you JS
                if($scope.markers[marker].type == "trail"){
                    $scope.markers[marker].icon.className = "arrow_box";
                }
                if($scope.markers[marker].type == "poi"){
                    $scope.markers[marker].icon.className = "arrow_box arrow_box_point";
                }
            }
        }
    };


    $scope.getSOS=function(){
//sharedUtils.showLoading();
//
//var sendSmsApp = {
//    sendSms: function() {
//
//
//        //CONFIGURATION
//        var options = {
//            replaceLineBreaks: false, // true to replace \n by a new line, false by default
//            android: {
//               // intent: 'INTENT'  // send SMS with the native android SMS messaging
//                intent: '' // send SMS without open any other app
//            }
//        };
//
//        var success = function () { sharedUtils.showAlert("","Please hold on tight while help we try to locate you."); };
//        var error = function (e) { alert('Message Failed:' + e); };
//        sms.send("+919220592205", "MWL4N HELP "+window.localStorage.getItem('teamId'), options, success, error);
//    }
//};
//
if(confirm('Are you sure you want to send SOS message for help ?')){
                        sharedUtils.showLoading();
                        
                        var link = 'http://132.148.144.248/sos.php';
                        $http.post(link, {lang:window.localStorage.getItem('teamId'),m:window.localStorage.getItem('m')}, { headers : {
                                   'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
                                   }})
                        .then(function (res){
                              sharedUtils.hideLoading();
                              $scope.response = res.data;
                              
                              
                              if($scope.response.responseCode=='200'){
                              
                              
                              sharedUtils.showAlert("Success", $scope.response.responseMessage);
                              //$state.go('tab.map', {}, {location: "replace", reload: true});
                              } else
                              { sharedUtils.showAlert("Error",$scope.response.responseMessage );}
                              
                              
                              
                              }, function(){
                              sharedUtils.hideLoading();
                              sharedUtils.showAlert("Error", "check your Internet Connection");});


}
else{
    sharedUtils.hideLoading();
}


         

    }

     //console.log("navigator.geolocation works well");


 // var successHandler = function (pedometerData) {
 //    //  pedometerData.startDate; -> ms since 1970
 //    //  pedometerData.endDate; -> ms since 1970
 //    //  pedometerData.numberOfSteps;
 //    //  pedometerData.distance;
 //    //  pedometerData.floorsAscended;
 //    //  pedometerData.floorsDescended;
 //    // alert(pedometerData.numberOfSteps);
 //     $rootScope.distancepedo=pedometerData.distance;
 //     $rootScope.numberOfSteps=pedometerData.numberOfSteps;

 // };

 // var onErrorHandler=function(data){console.log(data)};

 // pedometer.startPedometerUpdates(successHandler, onErrorHandler);

 // $scope.resetPedometre=function(){

 //    if(confirm('This will reset your Movement Data. Are you sure ?')){
 //    pedometer.stopPedometerUpdates(successCallback, failureCallback);

 //     pedometer.startPedometerUpdates(successHandler, onErrorHandler);

 // }

 // }



}])



.controller('loginCtrl', ['$scope', '$window', '$http', 'sharedUtils','$ionicViewService', '$state', function($scope, $window, $http, sharedUtils, $ionicViewService, $state) {
    $scope.user = {};

    if(window.localStorage.getItem('teamId'))
    //$state.go('tab.map', {}, {location: "replace", reload: true});
    window.location.href='#/tab/map';
    $scope.login=function(formname){

    if(formname.$valid){
        sharedUtils.showLoading();

       str="http://132.148.144.248/signin.php?t="+$scope.user.teamid+"&registrationId="+localStorage.getItem('registrationId')+"&m="+$scope.user.mobile;
            $http.get(str)
            .success(function (response){
                sharedUtils.hideLoading();
                $scope.user_details = response;
                if($scope.user_details.responseCode=='200')
                {
                
                window.localStorage.setItem('teamId', $scope.user_details.teamId );
                
                  window.localStorage.setItem('km', $scope.user_details.km );    
                   window.localStorage.setItem('name', $scope.user_details.name );  
                    window.localStorage.setItem('m', $scope.user_details.m);  
                     window.localStorage.setItem('otp', $scope.user_details.otp);  
                     console.log(window.localStorage.getItem('m'));          
                $ionicViewService.nextViewOptions({
                disableBack: true
                });

                // $ionicViewService.nextViewOptions({
                //     disableAnimate: true,
                //     disableBack: true
                // });

//     window.localStorage.setItem('otp', Math.floor((Math.random() * 1000) + 2000)); 
                
//                 var sendSmsApp = {
//     sendSms: function() {
        

//         //CONFIGURATION
//         var options = {
//             replaceLineBreaks: false, // true to replace \n by a new line, false by default
//             android: {
//                // intent: 'INTENT'  // send SMS with the native android SMS messaging
//                 intent: '' // send SMS without open any other app
//             }
//         };
        

//         var success = function () { alert('OTP sent successfully'); };
//         var error = function (e) { console.log('Message Failed:' + e); };
//         sms.send(window.localStorage.getItem('m'), "Your OTP for Oxfam Trailmate registration is : "+window.localStorage.getItem('otp'), options, success, error);
//     }
// };


// sendSmsApp.sendSms();

        console.log(window.localStorage.getItem('otp'));
                $state.go('tab.map', {}, {location: "replace", reload: true});

                //$state.go('tab.map', {}, {location: "replace", reload: true});

                }
                    else if($scope.user_details.responseCode=='100')
                    {
                        sharedUtils.hideLoading();
                        sharedUtils.showAlert("Login failed!",$scope.user_details.responseMessage);
                    }
                     else if($scope.user_details.responseCode=='0')
                    {
                        sharedUtils.hideLoading();
                        sharedUtils.showAlert("Login failed!",$scope.user_details.responseMessage);
                    }


            }).error(function() {
                sharedUtils.hideLoading();
                sharedUtils.showAlert("Error", "check your Internet Connection");
                    
            });
    }
    else
    {
        sharedUtils.showAlert("Required fields", "All fields are mandatory");
    }

    
}
}])


.controller('otpCtrl', function($scope, $state, $window, $ionicSideMenuDelegate, sharedUtils){
$scope.user = {};




    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
    
    $scope.verifyotp=function(formname){

        if(formname.$valid){
        sharedUtils.showLoading();

        if(window.localStorage.getItem('otp') == $scope.user.otp){
            sharedUtils.hideLoading(); 
            $state.go('tab.map', {}, {location: "replace", reload: true});
        }
        else{
             sharedUtils.hideLoading(); 
            window.localStorage.removeItem('teamId');
            sharedUtils.showAlert("Error", "Wrong OTP");

           
        }

        }
        else{
            sharedUtils.hideLoading(); 
            sharedUtils.showAlert("Error", "Enter OTP");

           
        }

    };
   
})


.controller('indexCtrl', function($scope, $window, $ionicSideMenuDelegate, BackgroundGeolocationService){

$scope.km=window.localStorage.getItem('km');
$scope.name=window.localStorage.getItem('name');



    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
    

    $scope.exitApp=function()
        {
            BackgroundGeolocationService.stop();
            ionic.Platform.exitApp();

           // alert("exit");
       }
})


.controller('TrailsCtrl', ['$scope', '$window', function($scope, $window) {
    $scope.trails = trails;
    $scope.bro = $window.localStorage['bro'] == "true";
}])

.controller('POICtrl', function($scope, $window, $ionicSideMenuDelegate){


    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
    $scope.points = points;
    $scope.bro = $window.localStorage['bro'] == "true";
})


.controller('weatherCtrl', function($scope, $window, $ionicLoading , $ionicViewService ,$http, $ionicSideMenuDelegate){


    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
   $scope.goPrevious = function(){
        var backView = $ionicViewService.getBackView();
        backView && backView.go();
    };



 var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  $scope.getIconUrl = function(iconId) {
      return 'http://openweathermap.org/img/w/' + iconId + '.png';
  };

  $ionicLoading.show();

  // Sunnyvale, CA
  var loc = {lat: 37.41, lng: -122.08};

  $http.get('http://api.openweathermap.org/data/2.5/weather?id=1264793&APPID=541e4e62dc286b79c6ccec9b171e4745').success(function (weather) {
    $scope.weather = weather;
    $ionicLoading.hide();
  }).error(function (err) {
    $ionicLoading.show({
      template: 'Could not load weather. Please try again later.',
      duration: 3000
    });
  });

  $scope.getDirection = function (degree) {
    if (degree > 338) {
      degree = 360 - degree;
    }
    var index = Math.floor((degree + 22) / 45);
    return directions[index];
  };





})



.controller('retireCtrl', function($scope, $window, $ionicSideMenuDelegate, sharedUtils, $ionicViewService){


    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
    
    $scope.goPrevious = function(){
        var backView = $ionicViewService.getBackView();
        backView && backView.go();
    };

    sharedUtils.showAlert("Success", "Retired Successfully");
})


.controller('disclaimarCtrl', function($scope, $window, $state, $ionicSideMenuDelegate, sharedUtils, $ionicViewService){

 if(window.localStorage.getItem('teamId'))
    window.location.href='#/tab/map';
    //$state.go('tab.map', {}, {location: "replace", reload: true});

    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
    
   $scope.next=function(formname){

    if(formname.$valid){
        $state.go('login', {}, {location: "replace", reload: true});

    }else
    {
        sharedUtils.showAlert("Warning", "Please agree");
    }

   }

    
})

.controller('broadcastsCtrl', function($scope, $window, $ionicSideMenuDelegate, $ionicViewService, sharedUtils, $http){


    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
    
    $scope.goPrevious = function(){
        var backView = $ionicViewService.getBackView();
        backView && backView.go();
    };


sharedUtils.showLoading();

str="http://132.148.144.248/messagelist.php";
            $http.get(str)
            .success(function (response){
                sharedUtils.hideLoading();
                $scope.response=response.responseCode;


                $scope.messagelist = response.timelist;
                
                
                if($scope.response == '100'){
                    
                        sharedUtils.hideLoading();                 
                    sharedUtils.showAlert("Success", $scope.response.responseMessage);
                  
                } 

            }).error(function() {
                sharedUtils.hideLoading();
                sharedUtils.showAlert("Error", "check your Internet Connection");
                    
            });




})



.controller('feedbackCtrl', function($scope, $window, $ionicLoading, sharedUtils, $http, $state, $ionicSideMenuDelegate, $ionicViewService){


    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
    
    $scope.goPrevious = function(){
        var backView = $ionicViewService.getBackView();
        backView && backView.go();
    };


$scope.sendfeedback=function(formname, data){

$scope.data={};

if(formname.$valid){

        sharedUtils.showLoading();

//  sharedUtils.showLoading();
            var link = 'http://132.148.144.248/feedback.php';
            $http.post(link, {teamId:window.localStorage.getItem('teamId'), m:window.localStorage.getItem('m'), f:$scope.data.feedback, r:$scope.data.rating}, { headers : {
        'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
    }})
            .then(function (res){
                sharedUtils.hideLoading();
                $scope.response = res.data; 
                

                if($scope.response.responseCode=='200'){
                    $scope.title="Success";
                    $scope.template="Thanks for sharing your feedback. It will help us improve your experience next time.";
                                        
                   sharedUtils.showAlert($scope.title,$scope.template);
                  
                } else if($scope.response.responseCode=='0')
                { 
                     sharedUtils.hideLoading();
                    sharedUtils.showAlert("Success","Thanks for sharing your feedback. It will help us improve your experience next time." );}
                
            
                
            }, function(){
                sharedUtils.hideLoading();
                sharedUtils.showAlert("Success", "Thanks for sharing your feedback. It will help us improve your experience next time.");});
}else{
    sharedUtils.hideLoading();
 sharedUtils.showAlert("Required Field","All fields are mandatory" );

}
 
}



})

.controller('sharemyprogressCtrl', function($scope, $window, $ionicLoading, $ionicSideMenuDelegate, $ionicViewService){


    if($ionicSideMenuDelegate.isOpenLeft())
    {
    $ionicSideMenuDelegate.toggleLeft();
    $ionicSideMenuDelegate.canDragContent(false); 
    }
    
    $scope.goPrevious = function(){
        var backView = $ionicViewService.getBackView();
        backView && backView.go();
    };





    function onSuccess1(position) {
        
        $ionicLoading.hide();
        latlong= position.coords.latitude+","+position.coords.longitude;
          console.log(latlong);
       

        var options = {
  message: '', // not supported on some apps (Facebook, Instagram)
  subject: 'Oxfam Trailwalk 2017', // fi. for email
  files: ['', ''], // an array of filenames either locally or remotely
  url: 'https://www.google.com/maps/?q='+latlong,
  chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
}

var onSuccess = function(result) {
  console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
  console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
}

var onError = function(msg) {
    $ionicLoading.hide();
  console.log("Sharing failed with message: " + msg);
}

window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);


        
    }

    function onError1(error) {
        console.log('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    function onWait1(){
      
        console.log("waiting...");
    }



    $scope.shareFacebook=function(){
    $ionicLoading.show({
      template: 'App is trying to fetch your location'
     
    });

getAccurateCurrentPosition(onSuccess1, onError1, onWait1);




    }



})

.controller('POIDetailCtrl', function($scope, $stateParams, $state, $ionicViewService, trailLocator){
    $scope.poi = points[$stateParams.poi];

    $scope.goPrevious = function(){
        var backView = $ionicViewService.getBackView();
        backView && backView.go();
    };

    $scope.goToPoi = function(poi){
        trailLocator.center = {
            lat: poi.geojson.coordinates[0],
            lng: poi.geojson.coordinates[1],
            zoom: 15
        };
        $state.go('tab.map');
    };
})
.controller('TrailDetailCtrl', ['$scope', '$state', '$ionicViewService', '$stateParams', 'trailLocator',
function($scope, $state, $ionicViewService, $stateParams, trailLocator) {

    $scope.trail = trails[$stateParams.trail];

    $scope.goPrevious = function(){
        var backView = $ionicViewService.getBackView();
        backView && backView.go();
    };

    $scope.goToTrail = function(trail){
        trailLocator.center = {
            lat: trail.geojson.features[0].geometry.coordinates[trail.marker.coordinates][1] + trail.marker.offset_lat,
            lng: trail.geojson.features[0].geometry.coordinates[trail.marker.coordinates][0] + trail.marker.offset_lng,
            zoom: 15
        };
        $state.go('tab.map');
    };
}])

.controller('ExtrasCtrl', ['$scope', '$window', 'TrailCache','$http','sharedUtils', function($scope, $window, TrailCache, $http, sharedUtils) {




sharedUtils.showLoading();

str="http://132.148.144.248/getcontact.php";
            $http.get(str)
            .success(function (response){
                sharedUtils.hideLoading();
                $scope.response=response.responseCode;


                $scope.contacts = response.contacts;
                
                
                if($scope.response == '100'){
                    
                                        
                    sharedUtils.showAlert("Success", $scope.response.responseMessage);
                  
                } 

            }).error(function() {
                sharedUtils.hideLoading();
                sharedUtils.showAlert("Error", "check your Internet Connection");
                    
            });




    $scope.openlink = function(url){
        window.open(url, '_system');
    };
    $scope.checkpass = function(value){
        //Congratulations. Information wants to be free.
        if(value == 'porcini'){
            $window.localStorage['bro'] = true;
            $scope.msg = "Trails unlocked!";
            TrailCache.trailData = null;
            TrailCache.markers = [];
        }
    };
}]);
