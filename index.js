'use strict';

const apiKeyYT = 'AIzaSyB86KKbVi9hVO_bRbwLPDsYczwl59B0EgA'; 
const searchURLYT = 'https://www.googleapis.com/youtube/v3/search';

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayLyrics(responseJson, searchArtist, searchTrack) {
  $('#results-lyrics').empty();
  console.log(responseJson);
  //converts text data into legible standard lyric format
  const resultsLyrics = JSON.stringify(responseJson.lyrics).replace(/\\n/g, "<br>").replace(/\\r/g, "").replace(/\\/g, "");

let newText = resultsLyrics.replace("Paroles de la chanson", "");
let editText = newText.slice(0, -1)
let newLyrics = editText.replace('par', "by").substring(1);
  
  $('#results-lyrics').append(
      `<h3><b>${searchArtist.toUpperCase()} - "${searchTrack.toUpperCase()}"</b></h3>
      <p>${newLyrics}</p>
    `
    ); 
  $('#results').removeClass('hidden');
};

function getLyrics (searchArtist, searchTrack) {
  
  console.log(searchArtist, searchTrack);
  fetch(`https://api.lyrics.ovh/v1/${searchArtist}/${searchTrack}`) 
  .then(response => {
      if (response.ok) {
        
        return response.json();
      }
      throw new Error(response.error);
    })
    .then(responseJson => displayLyrics(responseJson, searchArtist, searchTrack))
    .catch(err => {
    //if song not found in lyrics database or user only searches for artist, return videos instead
    if (searchTrack === ""){
      $('#js-error-message').html(`<h3>Here are some of ${searchArtist}'s most popular videos.</h3>`);
      } else {
      $('#js-error-message').html("<h3>Sorry, we couldn't find the lyrics for that song but here are some related videos!</h3>")};
    });
}

function getYouTubeVideos(searchYT, maxResults=3) {
  const params = {
    key: apiKeyYT,
    q: searchYT,
    part: 'snippet',
    maxResults,
    type: 'video',
    videoEmbeddable: 'true'
  };
  const queryString = formatQueryParams(params)
  const urlYT = searchURLYT + '?' + queryString;

  console.log(urlYT);

  fetch(urlYT)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').html(`<h3>Something went wrong: Please try again later.</h3>`);
    });
}

function displayResults(responseJson) {
  console.log(responseJson);
  $('#results-videos').empty();
  for (let i = 0; i < responseJson.items.length; i++){
    $('#results-videos').append(
      `<li><h3>${responseJson.items[i].snippet.title}</h3></li>
      <li><p>${responseJson.items[i].snippet.description}</p></li>
      <li><div class='iframe-container'><iframe src='https://www.youtube.com/embed/${responseJson.items[i].id.videoId}' width='400' height='300' allowfullscreen frameborder='0' class='video'></iframe></div>
      </li>`
    )};
  $('#results').removeClass('hidden');
};


function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    $('#results-lyrics').empty();
    const searchArtist = $('#js-search-artist').val();
    const searchTrack = $('#js-search-track').val();
    //pass single string as youtube search parameter
    const searchYT = searchArtist + " " + searchTrack;
    getLyrics(searchArtist, searchTrack);
    getYouTubeVideos(searchYT);
    //remove any error messages from previous search
    $('#js-error-message').text("");
    $('#js-search-artist').val("");
    $('#js-search-track').val("");
  });
}

$(watchForm);
