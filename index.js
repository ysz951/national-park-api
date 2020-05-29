
'use strict';


const searchURL = 'https://developer.nps.gov/api/v1/parks';
const apiKey = 'x9X8Jp1S0wfCS3ed0YRcqoaXIqeTOlxqEOyGLC3n';

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function getTokens(rawString) {
  return rawString.toUpperCase().split(/[ ,!.";:-]+/).filter(Boolean);
}

function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  $('#results-list').empty();
  // if there is no result
  if (responseJson.data.length === 0){
    $('#results-list').append(
      `<li><h3>No results found</h3></li>`);
  }
  // iterate through the items array
  for (let i = 0; i < responseJson.data.length; i++){
    
    let addressObject = responseJson.data[i].addresses[0];
    $('#results-list').append(
      `<li><h3>${responseJson.data[i].fullName}</h3>
      <p>${responseJson.data[i].description}</p>
      <p><a href="${responseJson.data[i].url}">More information</a></p>
      <p>Location: ${addressObject.line1}, ${addressObject.line2 ? `${addressObject.line2} ,` : ''}${addressObject.city}, ${addressObject.stateCode}  ${addressObject.postalCode}</p>
      <img src='${responseJson.data[i].images[0].url}' alt='${responseJson.data[i].fullName}'>
      </li>`
    )};
  //display the results section  
  $('#results').removeClass('hidden');
};

function getParks(searchTerm, maxResults=10) {
  const params = {
    api_key: apiKey,
    limit: maxResults
  };

  const queryString = formatQueryParams(params)
  // using regular expression to split searchTerm
  let regularString = getTokens(searchTerm);
  // get the state code params
  let stateCodeParams = [];
  stateCodeParams = regularString.map(str => formatQueryParams({stateCode: str}));
  // build the complete url
  const url = searchURL + '?' + queryString + '&' + stateCodeParams.join('&');

  console.log(url);

  const options = {
    // the apiKey in the header will be blocked by CORS policy
    headers: new Headers(
      // {"X-Api-Key": apiKey}
      )
  };
  // clear error message
  $('#js-error-message').text('');
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    const maxResults = $('#js-max-results').val();
    getParks(searchTerm, maxResults);
  });
}
$(watchForm);