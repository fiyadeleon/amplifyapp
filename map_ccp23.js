console.log("map_ccp23.js");

function clearUI(){

  $("#contact_id").text("");
  $("#call_status").text("");

}

//setting up the HTML contact_id value
function updateUI(contactId) {

  $("#contact_id").text(contactId);

}

function setStatus(status) {
  $("#status").text(status);
}

function setAgentName(name) {
  $("#agent_name").text(name);
}

// initialize the streams api
function init() {
  //clearUI();
  setStatus("Initializing...");

  var containerDiv = document.getElementById("container-div");
  var instanceURL = "https://clearsourcebpo.my.connect.aws/ccp-v2/";

  console.log("init()");
  console.log(containerDiv);
  // initialize the ccp
  connect.core.initCCP(containerDiv, {
    ccpUrl: instanceURL, // REQUIRED
    loginPopup: true, // optional, defaults to `true`
    loginPopupAutoClose: true, // optional, defaults to `false`
    loginOptions: {
      // optional, if provided opens login in new window
      autoClose: true, // optional, defaults to `false`
      height: 600, // optional, defaults to 578
      width: 400, // optional, defaults to 433
      top: 0, // optional, defaults to 0
      left: 0, // optional, defaults to 0
    },
    region: "us-west-2", // REQUIRED for `CHAT`, optional otherwise
    softphone: {
      // optional, defaults below apply if not provided
      allowFramedSoftphone: true, // optional, defaults to false
      disableRingtone: false, // optional, defaults to false
      ringtoneUrl: "", // optional, defaults to CCP’s default ringtone if a falsy value is set
    },
    pageOptions: {
      //optional
      enableAudioDeviceSettings: false, //optional, defaults to 'false'
      enablePhoneTypeSettings: true, //optional, defaults to 'true'
    },
    ccpAckTimeout: 5000, //optional, defaults to 3000 (ms)
    ccpSynTimeout: 3000, //optional, defaults to 1000 (ms)
    ccpLoadTimeout: 10000, //optional, defaults to 5000 (ms)
  });



  connect.contact(function (contact) {
    contact.onConnected(function (contact) {
      setStatus("onConnected event");
      console.log("*** contact.onConnected()");
      console.log(contact);
      $("#call_status").text("onConnected");

      //Updating the Agent interface "CallerInformation"
      updateUI(
     
        contact.getContactId()
     
      );
    });

    contact.onACW(function () {
      setStatus("onACW event");
     
      document.getElementById("buttonDisposition").disabled = false;
    });

    contact.onEnded(function (contact) {
      const state = contact.getState();
      setStatus("onEnded event - state: " + JSON.stringify(state));
    });

    contact.onDestroy(function (contact) {
      const state = contact.getState();
      setStatus("onDestroy event - state: " + JSON.stringify(state));
      clearUI();
    });
  });

  connect.agent(function (agent) {
    setAgentName(agent.getName());
  });

  // Additional initialization steps
  setStatus("End initialization");
  setAgentName("[AGENT NAME]");
  $("#buttonDisposition").click(submitDisposition);
}

function submitDisposition() {
  console.log("submitDisposition()");

  if($("#selectDisposition option:selected").text() == "Choose your Disposition"){

    window.alert("Invalid Disposition, Choose Disposition");

  }
  else{

    const url =
    "https://fu5uu4cwqisfegjbbbcfqgrte40knmbn.lambda-url.us-west-2.on.aws";

  const payload = {
    contactId: $("#contact_id").text(),
    disposition: $("#selectDisposition option:selected").text(),

  };

  fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: "Bearer temp123",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      console.log(response);
      if (response.status != 200) {
        alert('An error occurred submitting your disposition.');
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      setStatus('Response from dispostion API: ' + data);
    });

  $("#selectDisposition").prop("selectedIndex", 0);

  //refresh UI
  document.getElementById("buttonDisposition").disabled = true;
  clearUI();

  }

  
}

$(document).ready(init);
