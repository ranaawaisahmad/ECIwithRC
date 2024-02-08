var app = require('express')();
var session = require('express-session');
const RC = require('@ringcentral/sdk').SDK
var path = require('path')
require('dotenv').config();
const fs = require('fs');
const FormData = require('form-data');
const { type } = require('os');
const axios = require('axios');

var usePKCE = false; // change to true for enabling authorization code with PKCE flow
var access_token;
var cou = 0;
var salesforceOAuthToken;
let fileCounter = 0;
var filename;

app.use(session({ secret: 'somesecretstring', tokens: '' }));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

REDIRECT_URL = 'http://localhost:5000/oauth2callback';

var rcsdk = new RC({
  'server': 'https://platform.ringcentral.com',
  'clientId': '4g1U9s68yKqe3CeYbW1PCM',
  'clientSecret': '5tTOvQC5rPNfnklZGGceKoV3zMHorVVW1ct98dGpmYjD',
  'redirectUri': REDIRECT_URL
});

var server = require('http').createServer(app);
server.listen(5000);
console.log("listen to port 5000")

app.get('/index', function(req, res) {
  res.redirect("/")
})

app.get('/', async function(req, res) {
  var platform = rcsdk.platform()
  if (req.session.tokens != undefined) {
    platform.auth().setData(req.session.tokens)
    if (await platform.loggedIn()) {
      return res.render('test')
    }
  } else {
    res.render('index', {
      authorize_uri: platform.loginUrl({
        redirectUri: REDIRECT_URL,
        usePKCE,
      })
    });
  }
})

app.get('/logout', async function(req, res) {
  if (req.session.tokens != undefined) {
    var platform = rcsdk.platform()
    platform.auth().setData(req.session.tokens)
    if (platform.loggedIn()) {
      try {
        var resp = await platform.logout()
        console.log("logged out")
      } catch (e) {
        console.log(e)
      }
    }
    req.session.tokens = null
  }
  res.redirect("/")
});

app.get('/oauth2callback', async function(req, res) {
  if (req.query.code) {
    try {
      var platform = rcsdk.platform()
      var resp = await platform.login({
        code: req.query.code,
        redirectUri: REDIRECT_URL
      })
      req.session.tokens = await resp.json()
      access_token = req.session.tokens;
      console.log(req.session.tokens)
      res.redirect("/test")
    } catch (e) {
      res.send('Login error ' + e);
    }
  } else {
    res.send('No Auth code');
  }
});

app.get('/test', async function(req, res) {
  if (req.session.tokens != undefined) {
    access_token = req.session.tokens.access_token;
    console.log('token: ', access_token);
    var platform = rcsdk.platform()
    platform.auth().setData(req.session.tokens)
    if (platform.loggedIn()) {
      if (req.query.api == "extension") {
        var endpoint = "/restapi/v1.0/account/~/extension"
        var params = {}
        return callGetMethod(platform, endpoint, params, res)
      } else if (req.query.api == "extension-call-log") {
        var endpoint = "/restapi/v1.0/account/~/extension/~/call-log"
        var params = {}
        return callGetMethod(platform, endpoint, params, res)
      } else if (req.query.api == "account-call-log") {
        var endpoint = "/restapi/v1.0/account/~/call-log"
        var params = {
          dateFrom: "2024-02-02T00:00:00.577Z",
          dateTo: "2024-02-05T23:59:59.577Z",
          view: "Detailed",
          perPage: 200
        }
        return callGetMethodForPaging(platform, endpoint, params, res, access_token)
      }
    }
  }
  res.redirect("/")
});

async function callGetMethod(platform, endpoint, params, res) {
  try {
    var resp = await platform.get(endpoint, params)
    var jsonObj = await resp.json()
    res.send(JSON.stringify(jsonObj))
  } catch (e) {
    res.send("Error: " + e.message)
  }
}

// login to th RingCentral portal 
async function callGetMethodForPaging(platform, endpoint, params, res, access_token) {
  try {
    var resp = await platform.get(endpoint, params)
    var jsonObj = await resp.json()
    var toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri='', userName;
    for (var record of jsonObj.records){
      // parse record and save it to your db
      toNumber = record.to.phoneNumber;
      fromNumber = record.from.phoneNumber;
      callType = record.direction;
      duration = record.duration;
      externalId = record.id;
      startTime = record.startTime;
      endTime = record.lastModifiedTime;
      if (record.recording != undefined && record.recording.contentUri != undefined) {
        uri = record.recording.contentUri;
      } else {
        console.log('ContentUri is missing: ', uri);
      }

      if (record.from != undefined && record.from.name != undefined) {
         userName = record.from.name;
      } else {
        console.log('UserName is missing: ', userName);
      }

      var n = 1;
      if (userName != undefined && uri != undefined) {
        if (userName === "Tyrell Jensen") {
          var userId = "0058W00000Ap21tQAB";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
                
        } else if (userName === "Derek Easton") {
          var userId = "0058W00000CuNxMQAV";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Declan Donahue") {
          var userId = "0055w00000EDE8OAAX";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
              res.send("Error: " + error.message)
            }
        } else if (userName === "Phil Ferrara") {
          var userId = "0055w00000EC60IAAT";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Erick Lindewall") {
          var userId = "0055w00000EBiRJAA1";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Keith Schettino") {
          var userId = "0055w00000EC7g5AAD";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Joshua Rhem") {
          var userId = "0058W00000E7BFgQAN";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        }
      }
      // console.log(JSON.stringify(jsonObj))
      console.log("======= ^^^^^ ========")
      cou++;
    }
    console.log("One Page Count: ", cou);
    // Check if there are next pages
    var navigationObj = jsonObj.navigation
    if (navigationObj.hasOwnProperty("nextPage")){
      read_calllog_nextpage(platform, navigationObj.nextPage.uri, res, access_token)
    }else{
      console.log("no next page. Done")
    }
    res.send(JSON.stringify(jsonObj))
  } catch (e) {
    res.send("Error: " + e.message)
  }
}

async function read_calllog_nextpage(platform, url, res, access_token){
  try {
    var resp = await platform.get(url)
    var jsonObj = await resp.json()
    var toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri='', userName;
    for (var record of jsonObj.records){
      // parse record and save it to your db
      // console.log(JSON.stringify(record))
      toNumber = record.to.phoneNumber;
      fromNumber = record.from.phoneNumber;
      callType = record.direction;
      duration = record.duration;
      externalId = record.id;
      startTime = record.startTime;
      endTime = record.lastModifiedTime;
      if (record.recording != undefined && record.recording.contentUri != undefined) {
        uri = record.recording.contentUri;
      } else {
        console.log('ContentUri is missing: ', uri);
      }

      if (record.from != undefined && record.from.name != undefined) {
        userName = record.from.name;
      } else {
        console.log('UserName is missing: ', userName);
      }
      
      if (userName != undefined && uri != undefined) {
        if (userName === "Tyrell Jensen") {
          var userId = "0058W00000Ap21tQAB";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
                  
        } else if (userName === "Derek Easton") {
          var userId = "0058W00000CuNxMQAV";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Declan Donahue") {
          var userId = "0055w00000EDE8OAAX";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Phil Ferrara") {
          var userId = "0055w00000EC60IAAT";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Erick Lindewall") {
          var userId = "0055w00000EBiRJAA1";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Keith Schettino") {
          var userId = "0055w00000EC7g5AAD";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        } else if (userName === "Joshua Rhem") {
          var userId = "0058W00000E7BFgQAN";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            res.send("Error: " + error.message)
          }
        }
      }
      console.log("======= ^^^^^ ========")
      cou++;
    }
    console.log("After All Pages Count: ", cou);
    // Check if there are next pages
    var navigationObj = jsonObj.navigation
    if (navigationObj.hasOwnProperty("nextPage")){
      read_calllog_nextpage(platform, navigationObj.nextPage.uri, res, access_token)
    }else{
      console.log("no more next page. Done")
    }
    res.send(JSON.stringify(jsonObj))
  } catch (e){
    console.log(e.message)
  }
}

// function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
async function getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token) {
  if (userId && toNumber && fromNumber && startTime && endTime && callType && duration && externalId && uri && access_token) {
    try {
      // Calling the get OAuth function
      if (!salesforceOAuthToken) {
        salesforceOAuthToken = await getSalesforceOAuthToken();
      }
      console.log('Salesforce OAuth Token:', salesforceOAuthToken);
      
      // Calling the create voice call function
      //const voiceCallData = await createVoiceCall(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId);
      let voiceCallData;
      try {
        voiceCallData = await createVoiceCall(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId);
        if (!voiceCallData || !voiceCallData.voiceCallId) {
          console.error('Failed to create voice call or voiceCallId is missing');
          // Handle the error appropriately
          return;
        }
        console.log('VoiceCall created successfully with ID:', voiceCallData.voiceCallId);
        // download the recording file
        let filename; 
        try {
          filename = await downloadRecording(uri, access_token);
          if (!filename) {
            console.error('Failed to download voicecall recording: ', filename);
            return;
          }
        } catch (error) {
          console.error('Error in downloading:', error.message);
          // Handle the error appropriately
          return;
        }
        console.log('filename2:', filename);
        if (filename) {
          if (voiceCallData) {
            const voiceCallId = voiceCallData.voiceCallId;
            console.log('Voice Call Id:', voiceCallId);
              
            const recordingFilePath = `C:/Users/Awais/OneDrive/Documents/RingCentral/${filename}`; 
            // Calling the upload recording function
            try {
              await uploadRecording(voiceCallId, recordingFilePath);
            } catch (error) {
              console.error('Error in uploading:', error.message);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error in creating voice call:', error.message);
        // Handle the error appropriately
        return;
      }
      
    } catch (error) {
      console.error('An error occurred:', error);
    }    
  } else {
    console.error('Some data is missing from RC side for creating VoiceCall');
  }
}

// function for Salesforce AuthToken
async function getSalesforceOAuthToken() {
  const clientId = '3MVG95jctIhbyCprl6AVDc5U0cUBjQSIre8F8JKIOk9jNGJpgeTof0h5aozdJR2bQ8HKOrBY.Illi2rjPZkzX';
  const clientSecret = '034B13085247755B4E430C3F1AB03DEC472681477D2CEC885AC7325A638F26BF';
  const username = 'jalil@dmi.com';
  const password = '!wyR5uEEpZ1F';
  const securityToken = 'iWNEzFh1ZCUXuL0ZbSAIVY4s';

  try {
    const response = await axios.post(
      `https://dmi0.my.salesforce.com/services/oauth2/token`,
      `grant_type=password&client_id=${clientId}&client_secret=${clientSecret}&username=${username}&password=${password}${securityToken}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    if (response.status === 200) {
      return response.data.access_token;
    } else {
      console.error(`Error obtaining Salesforce OAuth token: ${response.status}, ${response.data}`);
      return null;
    }
  } catch (error) {
    console.error('Error obtaining Salesforce OAuth token:', error.message);
    return null;
  }
}

// Replace these values with your actual credentials and endpoints
const CONNECT_BASE_URL = 'https://dmi0.my.salesforce.com/services/data/v58.0';
const SALESFORCE_OAUTH_TOKEN = salesforceOAuthToken;
const SALESFORCE_USER_ID = '0055w00000EDNFYAA5';
const SALESFORCE_RECORD_ID = '00Q8W00000pUwCNUA0';

// Step 1: Create VoiceCall
async function createVoiceCall(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId) {
  const payload = {
    "calls": [
      {
        "toPhoneNumber":toNumber,
        "fromPhoneNumber":fromNumber,
        "userId":userId,
        "startDateTime":startTime,
        "endDateTime":endTime,
        "callType":callType,
        "recordingDuration":duration,
        "externalId":externalId,
        "recordingFormat":"mp3",
        //"activityId":"",
        //"recordId":"",
        "mediaProviderId":"0hn8W000000XZIHQA4"
      }
    ]
  };

  try {
    const response = await axios.post(`${CONNECT_BASE_URL}/voicecalls`, payload, {
      headers: { Authorization: `Bearer ${salesforceOAuthToken}` },
    });

    if (response.status === 200 || response.status === 201) {
      console.log('VoiceCall created successfully');
      for (var call of response.data.calls){
        if (call.voiceCallId) {
          return call;
        }
      }
      if (response.data.calls.voiceCallId) {
        return response.data.calls;
      }
    } else {
      console.error(`Error creating VoiceCall: ${response.status}, ${response.data}`);
      return null;
    }
  } catch (error) {
    console.error('Error creating VoiceCall:', error.message);
    return null;
  }
}

// Step 2: Upload Recording
async function uploadRecording(voiceCallId, recordingFilePath) {
  const formData = new FormData();
  formData.append('audioFileData', fs.createReadStream(recordingFilePath));

  try {
    const response = await axios.post(`${CONNECT_BASE_URL}/voicecalls/${voiceCallId}/audio_upload`, formData, {
      headers: {
        Authorization: `Bearer ${salesforceOAuthToken}`,
        ...formData.getHeaders(),
      },
    });

    if (response.status === 204) {
      console.log('Recording uploaded successfully');

      // Delete the file after successful upload
      fs.unlink(recordingFilePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log(`File is deleted successfully: ${recordingFilePath}`);
        }
      });

    } else {
      console.error(`Error uploading recording: ${response.status}, ${response.data}`);
    }
  } catch (error) {
    console.error('Error uploading recording:', error.message);
  }
}

// function for downloading the recording
async function downloadRecording(uri, access_token) {
  // OPTIONAL QUERY PARAMETERS
  const queryParams = {
    contentDisposition: 'Inline',
    contentDispositionFilename: 'rec'
  };

  const urlStr = uri;

  // Parse the URL
  const url = new URL(urlStr);

  // Extract the server (origin) and endpoint (pathname)
  const server = url.origin;
  const endpoint = url.pathname;

  if (!access_token) {
    console.error('Token not provided.');
    return null;
  }

  try {
    const response = await axios({
      method: 'GET',
      url: endpoint,
      baseURL: server,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      responseType: 'arraybuffer', // Important for binary responses
      params: queryParams,
    });

    fileCounter++; // Increment the counter for each file
    const filename = `recording${fileCounter}.mp3`;

    await fs.promises.writeFile(filename, response.data);
    console.log(`File saved as ${filename}`);
    return filename;

  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data ? error.response.data.toString() : 'No additional error information';
      console.error('Error downloading recording:', error.response.status, errorMessage);
    } else {
      console.error('Error downloading recording:', error.message);
    }
    return null;
  } 
}
