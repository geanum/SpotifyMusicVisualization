// Adapted from Spotify Authorization Implicit Grant Example
// https://github.com/spotify/web-api-auth-examples/blob/master/implicit_grant/public/index.html

// Client API Request stuff
var CLIENT_ID = '0597f4f7a5524842a9066443c4a80408';
var REDIRECT_URI = 'http://localhost:8000/'; 

(function() {

  var stateKey = 'spotify_auth_state';

  // Used to hash things
  function generateRandomString(length) {

    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  // Used to get URL params
  function getHashParams() {

    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  var userProfile = document.getElementById('user-profile');

  var params = getHashParams();

  var access_token = params.access_token,
      state = params.state,
      storedState = localStorage.getItem(stateKey);

  // State and access token decide which elements shown
  if (access_token && (state == null || state !== storedState)) { // Access Token but invalid state
    alert('There was an error during the authentication');
  } else {
    //localStorage.removeItem(stateKey); Removed to let browser remember state in case of refresh
    if (access_token) {
      $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log(response);
            userProfile.innerHTML = response.id;
            $('#login').hide();
            $('#loggedin').show();
          }
      });
    } else {  // Not logged in yet
        $('#login').show();
        $('#loggedin').hide();
    }

    // Set redirect for LogInClick
    document.getElementById('login-button').addEventListener('click', function() {
      var client_id = CLIENT_ID;
      var redirect_uri = REDIRECT_URI;
      var state = generateRandomString(16);
      localStorage.setItem(stateKey, state);
      var scope = 'user-read-private user-read-email';

      var url = 'https://accounts.spotify.com/authorize';
      url += '?response_type=token';
      url += '&client_id=' + encodeURIComponent(client_id);
      url += '&scope=' + encodeURIComponent(scope);
      url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
      url += '&state=' + encodeURIComponent(state);

      console.log(url);
      window.location = url;
    }, false);
  }
})();
