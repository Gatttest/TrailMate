// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('sctrails', ['ionic', 'leaflet-directive', 'sctrails.controllers', 'sctrails.services'])

.run(function($ionicPlatform, BackgroundGeolocationService, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)


     $rootScope.distancepedo=0;
     $rootScope.numberOfSteps=0;
    $rootScope.km=0;
     $rootScope.name='';


  BackgroundGeolocationService.init();

  var push = PushNotification.init({ "android": {"senderID": "484931986699"},
          "browser":{},
         "ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} } );

    push.on('registration', function(data) {

        

        console.log('registration event: ' + data.registrationId);

  var oldRegId = localStorage.getItem('registrationId');
  if (oldRegId !== data.registrationId) {
    // Save new registration ID
    localStorage.setItem('registrationId', data.registrationId);
    // Post registrationId to your app server as the value has changed
  }


        // data.registrationId
    });

    push.on('notification', function(data) {
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData
//alert(data.message);
navigator.notification.alert(data.message);


console.log('notification event');
  // navigator.notification.alert(
  //   data.message,         // message
  //   null,                 // callback
  //   data.title,           // title
  //   'Ok'                  // buttonName
  // );

    });

    push.on('error', function(e) {
        // e.message
    });

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive

     .state('disclaimar', {
      url: "/disclaimar",
      
      templateUrl: "templates/disclaimar.html",
        controller: 'disclaimarCtrl'
    })
    
    .state('login', {
      url: "/login",
      
      templateUrl: "templates/login.html",
        controller: 'loginCtrl'
    })


     .state('otp', {
      url: "/otp",
      
      templateUrl: "templates/otp.html",
        controller: 'otpCtrl'
    })

     

    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.map', {
      url: '/map',
      cache: false,
      views: {
        'tab-map': {
          templateUrl: 'templates/tab-map.html',
          controller: 'MapCtrl'
        }
      }
    })

    .state('tab.trails', {
      url: '/trails',
      views: {
        'tab-trails': {
          templateUrl: 'templates/tab-trails.html',
          controller: 'TrailsCtrl'
        }
      }
    })

    .state('tab.poi', {
      url: '/poi',
      views: {
        'tab-trails': {
          templateUrl: 'templates/poi.html',
          controller: 'POICtrl'
        }
      }
    })
    .state('tab.poi-detail', {
      url: '/poi/:poi',
      views: {
        'tab-trail-detail': {
          templateUrl: 'templates/poi-detail.html',
          controller:'POIDetailCtrl'
        }
      }
    })
    .state('tab.trail-detail', {
      url: '/trails/:trail',
      views: {
        'tab-trail-detail': {
          templateUrl: 'templates/trail-detail.html',
          controller: 'TrailDetailCtrl'
        }
      }
    })

    .state('tab.extras', {
      url: '/extras',
      views: {
        'tab-extras': {
          templateUrl: 'templates/tab-extras.html',
          controller: 'ExtrasCtrl'
        }
      }
    })

    .state('tab.extras-tos', {
      url: '/tos',
      views: {
        'tab-extras': {
          templateUrl: 'templates/tos.html'
        }
      }
    })

     .state('tab.retire', {
      url: '/retire',
      views: {
        'tab-map': {
          templateUrl: 'templates/retire.html',
          controller: 'retireCtrl'
        }
      }
    })


 .state('tab.broadcasts', {
      url: '/broadcasts',
      views: {
        'tab-map': {
          templateUrl: 'templates/broadcasts.html',
          controller: 'broadcastsCtrl'
        }
      }
    })

 .state('tab.weather', {
      url: '/weather',
      views: {
        'tab-map': {
          templateUrl: 'templates/weather.html',
          controller: 'weatherCtrl'
        }
      }
    })

.state('tab.feedback', {
      url: '/feedback',
      views: {
        'tab-map': {
          templateUrl: 'templates/feedback.html',
          controller: 'feedbackCtrl'
        }
      }
    })


.state('tab.help', {
      url: '/help',
      views: {
        'tab-map': {
          templateUrl: 'templates/help.html',
          controller: 'helpCtrl'
        }
      }
    })

     ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/disclaimar');

});

