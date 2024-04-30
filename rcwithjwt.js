require('dotenv').config();
const RC = require('@ringcentral/sdk').SDK;
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const ffmpegPath = process.env.L_ffmpegPath;  // Replace with the actual path to your ffmpeg.exe
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

var accessToken;
var cou = 0;
var salesforceOAuthToken;
let fileCounter = 0;

var rcsdk = new RC({
  'server':       process.env.RC_SERVER,
  'clientId':     process.env.RC_CLIENT_ID,
  'clientSecret': process.env.RC_CLIENT_SECRET
});
var platform = rcsdk.platform();

platform.login({
  'jwt':  process.env.RC_JWT
});

// When login is successful, retrieve the access token
platform.on(platform.events.loginSuccess, async function() {
  console.log("User logged in successfully");
  try {
    // Get the current authentication data
    const authData = await platform.auth().data();
        
    // Retrieve the access token
    accessToken = authData.access_token;

    console.log("Access Token:", accessToken);

    // Get the call log from the specified endpoint
    var endpoint = process.env.RC_Endpoint;

    // Optional parameters for the call log request (e.g., date range, view type)
    var params = {
      dateFrom: "2024-04-29T00:00:00.577Z",
      dateTo: "2024-04-29T23:59:59.577Z",
      view: "Detailed",
      perPage: 200
    };

    // Make the GET request to fetch call logs
    if (accessToken) {
      callGetMethodForPaging(platform, endpoint, params, accessToken);
    } else {
      console.log('accecc token is not available');
    }
  } catch (error) {
    console.error("Error retrieving access token:", error);
  }
});

async function callGetMethodForPaging(platform, endpoint, params, access_token) {
  try {
    var resp = await platform.get(endpoint, params);
    var jsonObj = await resp.json();
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
        console.log('ContentUri is missing: ', externalId);
      }
  
      if (record.from != undefined && record.from.name != undefined) {
        userName = record.from.name;
      } else {
        console.log('UserName is missing: ', userName);
      }
  
      var n = 1;
      if ((userName != undefined || userName !='') && (uri != undefined || uri !='')) {
        if (userName === "Tyrell Jensen") {
          var userId = "0058W00000Ap21tQAB";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Derek Easton") {
          var userId = "0058W00000CuNxMQAV";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Declan Donahue") {
          var userId = "0055w00000EDE8OAAX";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Phil Ferrara") {
          var userId = "0055w00000EC60IAAT";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Erick Lindewall") {
          var userId = "0055w00000EBiRJAA1";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Keith Schettino") {
          var userId = "0055w00000EC7g5AAD";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Joshua Rhem") {
          var userId = "0058W00000E7BFgQAN";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        }
      }
      // console.log(JSON.stringify(jsonObj))
      console.log("======= ^^^^^ ========");
      cou++;
    }
    console.log("One Page Count: ", cou);
    // Check if there are next pages
    var navigationObj = jsonObj.navigation;
    if (navigationObj.hasOwnProperty("nextPage")){
      read_calllog_nextpage(platform, navigationObj.nextPage.uri, access_token)
    }else{
      console.log("no next page. Done");
    }
    // res.send(JSON.stringify(jsonObj))
  } catch (e) {
    console.log("Error: " + e.message);
  }
}
  
async function read_calllog_nextpage(platform, url, access_token){
  try {
    var resp = await platform.get(url);
    var jsonObj = await resp.json();
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
        
      if ((userName != undefined || userName !='') && (uri != undefined || uri !='')) {
        if (userName === "Tyrell Jensen") {
          var userId = "0058W00000Ap21tQAB";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }        
        } else if (userName === "Derek Easton") {
          var userId = "0058W00000CuNxMQAV";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            onsole.log("Error: " + error.message);
          }
        } else if (userName === "Declan Donahue") {
          var userId = "0055w00000EDE8OAAX";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Phil Ferrara") {
          var userId = "0055w00000EC60IAAT";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Erick Lindewall") {
          var userId = "0055w00000EBiRJAA1";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Keith Schettino") {
          var userId = "0055w00000EC7g5AAD";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        } else if (userName === "Joshua Rhem") {
          var userId = "0058W00000E7BFgQAN";
          // Calling the function for getting the salesforce oauth and create the voice call and upload the call recording to salesforce ECI
          try {
            await getOauthCreateVCandUploadRF(userId, toNumber, fromNumber, startTime, endTime, callType, duration, externalId, uri, access_token); 
          } catch (error) {
            console.log("Error: " + error.message);
          }
        }
      }
      console.log("======= ^^^^^ ========");
      cou++;
    }
    console.log("After All Pages Count: ", cou);
    // Check if there are next pages
    var navigationObj = jsonObj.navigation;
    if (navigationObj.hasOwnProperty("nextPage")){
      read_calllog_nextpage(platform, navigationObj.nextPage.uri, res, access_token)
    }else{
      console.log("no more next page. Done");
    }
    // res.send(JSON.stringify(jsonObj))
  } catch (e){
    console.log('Error: ', e.message);
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
                
            const recordingFilePath = process.env.L_Recording_File_Path +`${filename}`;
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
  const clientId = process.env.SF_CLIENT_ID;
  const clientSecret = process.env.SF_CLIENT_SECRET;
  const username = process.env.SF_USERNAME;
  const password = process.env.SF_PASSWORD;
  const securityToken = process.env.SF_SECUIRTY_TOKEN;
  
  try {
    const response = await axios.post(
      process.env.SF_OAUTH_URL,
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
const CONNECT_BASE_URL = process.env.SF_CONNECT_BASE_URL;
const MediaProviderId = process.env.SF_MediaProviderId;
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
        "mediaProviderId":MediaProviderId
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
  
      // Delete the stereo file after successful upload
      fs.unlink(recordingFilePath, (err) => {
        if (err) {
          console.error('Error in deleting stereo file:', err);
        } else {
          console.log(`File(Stereo) is deleted successfully: ${recordingFilePath}`);
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
    const filename2 = `stereo${fileCounter}.mp3`;
  
    await fs.promises.writeFile(filename, response.data);
    console.log(`File saved as ${filename}`);
  
    const inputfile = process.env.L_Recording_File_Path + `${filename}`;
    const outputfile = filename2;
    try {
      await runConversion(inputfile, outputfile);
  
      return filename2;
  
    } catch (error) {
      console.log('not saved converted file: ', error);
    }
  
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
  
// code for converting the mono call to stereo call
async function convertMonoToStereo(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    if (!inputFilePath) {
      reject(new Error('Input file path is empty'));
      return;
    }
  
    ffmpeg()
      .input(inputFilePath)
      .audioChannels(2) // Convert to stereo
      .audioCodec('libmp3lame')
      .on('end', () => {
        console.log('Conversion finished');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error:', err);
        reject(err);
      })
      .save(outputFilePath);
  });
}

// converting the mono call to stereo call
async function runConversion(inputfile, outputfile) {
  const inputFilePath = inputfile;
  const outputFilePath = process.env.L_Recording_File_Path + `${outputfile}`;

  try {
    await convertMonoToStereo(inputFilePath, outputFilePath);

    // Delete the mono file after successful converted to stereo
    fs.unlink(inputFilePath, (err) => {
      if (err) {
        console.error('Error in deleting mono file:', err);
      } else {
        console.log(`File(Mono) is deleted successfully: ${inputFilePath}`);
      }
    });
    
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}
