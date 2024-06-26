// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", function () {

  const startButton = document.getElementById("startCapture");
  const stopButton = document.getElementById("stopCapture");

  //const useServerCheckbox = document.getElementById("useServerCheckbox");
  //const testButton = document.getElementById("test");

  const useVadCheckbox = document.getElementById("useVadCheckbox");
  const languageDropdown = document.getElementById('languageDropdown');
  const taskDropdown = document.getElementById('taskDropdown');
  const modelSizeDropdown = document.getElementById('modelSizeDropdown');
  const folder_name = document.getElementById("folder_name");
  const speakers = document.getElementById("speakers");

  let selectedLanguage = null;
  let selectedTask = taskDropdown.value;
  let selectedModelSize = modelSizeDropdown.value;
  let selectedFolder = folder_name.value;
  let storedSpeakers = speakers.value;


  window.onload = function() {
    //var container = document.getElementsByClassName('slidecontainer')[0];
    var numSpeakers = document.getElementById("speakers");
    /*var numSpeakers = document.createElement("input");
    numSpeakers.type = 'range';
    numSpeakers.value = 5;
    numSpeakers.min = 1;
    numSpeakers.max = 25;
    numSpeakers.id = "speakers";
    container.append(numSpeakers);*/

    var output = document.getElementById("speakers_num");
    output.innerHTML = numSpeakers.value;

    numSpeakers.oninput = function() {
      output.innerHTML = this.value;
    }

  }
  //const speakers = document.getElementById("speakers");

  document.getElementById("ServersConnected").disabled = true;

  (async () => {
    // see the note below on how to choose currentWindow or lastFocusedWindow
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const url = new URL(tab.url);
    folder_name.value = url.hostname;
    selectedFolder = folder_name.value;
  })();


  // Add click event listeners to the buttons
  startButton.addEventListener("click", startCapture);
  stopButton.addEventListener("click", stopCapture);

  // Retrieve capturing state from storage on popup open
  chrome.storage.local.get("capturingState", ({ capturingState }) => {
    if (capturingState && capturingState.isCapturing) {
      toggleCaptureButtons(true);
    } else {
      toggleCaptureButtons(false);
    }
  });

  // Retrieve checkbox state from storage on popup open
/*   chrome.storage.local.get("useServerState", ({ useServerState }) => {
    if (useServerState !== undefined) {
      useServerCheckbox.checked = useServerState;
    }
  }); */

  chrome.storage.local.get("useVadState", ({ useVadState }) => {
    if (useVadState !== undefined) {
      useVadCheckbox.checked = useVadState;
    }
  });

  chrome.storage.local.get("selectedLanguage", ({ selectedLanguage: storedLanguage }) => {
    if (storedLanguage !== undefined) {
      languageDropdown.value = storedLanguage;
      selectedLanguage = storedLanguage;
    }
  });

  chrome.storage.local.get("selectedTask", ({ selectedTask: storedTask }) => {
    if (storedTask !== undefined) {
      taskDropdown.value = storedTask;
      selectedTask = storedTask;
    }
  });

  chrome.storage.local.get("selectedModelSize", ({ selectedModelSize: storedModelSize }) => {
    if (storedModelSize !== undefined) {
      modelSizeDropdown.value = storedModelSize;
      selectedModelSize = storedModelSize;
    }
  });

  chrome.storage.local.get("selectedFolder", ({ selectedFolder: storedFolder }) => {
    if (storedFolder !== undefined) {
      folder_name.value = storedFolder;
      selectedFolder = storedFolder;
    }
  });

/*   if (speakers.value !== undefined){
    selectedSpeakers = 5;
  } else {
    selectedSpeakers = speakers.value;
  } */

  chrome.storage.local.get("selectedSpeakers", ({ selectedSpeakers: storedSpeakers }) => {
    if (storedSpeakers !== undefined) {
      speakers.value = storedSpeakers;
      selectedSpeakers = storedSpeakers;
    }
  });

  // Function to handle the start capture button click event
  async function startCapture() {
    // Ignore click if the button is disabled
    if (startButton.disabled) {
      return;
    }

    // Get the current active tab
    const currentTab = await getCurrentTab();

    // Send a message to the background script to start capturing
    let host = "35.214.174.85";
    let port = "9292";


    chrome.runtime.sendMessage(
      {
        action: "startCapture",
        tabId: currentTab.id,
        host: host,
        port: port,
        language: selectedLanguage,
        task: selectedTask,
        modelSize: selectedModelSize,
        useVad: useVadCheckbox.checked,
        folder: selectedFolder,
        speakers: selectedSpeakers,
      }, () => {
        // Update capturing state in storage and toggle the buttons
        chrome.storage.local.set({ capturingState: { isCapturing: true } }, () => {
          toggleCaptureButtons(true);
        });
      }
    );
  }

  // Function to handle the stop capture button click event
  function stopCapture() {
    // Ignore click if the button is disabled
    if (stopButton.disabled) {
      return;
    }

    // Send a message to the background script to stop capturing
    chrome.runtime.sendMessage({ action: "stopCapture" }, () => {
      // Update capturing state in storage and toggle the buttons
      chrome.storage.local.set({ capturingState: { isCapturing: false } }, () => {
        toggleCaptureButtons(false);
      });
    });
  }

  // Function to get the current active tab
  async function getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0]);
      });
    });
  }

  // Function to toggle the capture buttons based on the capturing state
  function toggleCaptureButtons(isCapturing) {
    startButton.disabled = isCapturing;
    stopButton.disabled = !isCapturing;
    //useServerCheckbox.disabled = isCapturing;
    useVadCheckbox.disabled = isCapturing;
    modelSizeDropdown.disabled = isCapturing;
    languageDropdown.disabled = isCapturing;
    taskDropdown.disabled = isCapturing;
    startButton.classList.toggle("disabled", isCapturing);
    stopButton.classList.toggle("disabled", !isCapturing);
  }

  function testConnection() {

  }

  // Save the checkbox state when it's toggled
/*   useServerCheckbox.addEventListener("change", () => {
    const useServerState = useServerCheckbox.checked;
    chrome.storage.local.set({ useServerState });
  }); */

  useVadCheckbox.addEventListener("change", () => {
    const useVadState = useVadCheckbox.checked;
    chrome.storage.local.set({ useVadState });
  });

  languageDropdown.addEventListener('change', function() {
    if (languageDropdown.value === "") {
      selectedLanguage = null;
    } else {
      selectedLanguage = languageDropdown.value;
    }
    chrome.storage.local.set({ selectedLanguage });
  });

  taskDropdown.addEventListener('change', function() {
    selectedTask = taskDropdown.value;
    chrome.storage.local.set({ selectedTask });
  });

  modelSizeDropdown.addEventListener('change', function() {
    selectedModelSize = modelSizeDropdown.value;
    chrome.storage.local.set({ selectedModelSize });
  });

  folder_name.addEventListener('change', function() {
    selectedFolder = folder_name.value;
    chrome.storage.local.set({ selectedFolder });
  });

  speakers.addEventListener('change', function() {
    selectedSpeakers = speakers.value;
    chrome.storage.local.set({ selectedSpeakers });
  });


  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "updateSelectedLanguage") {
      const detectedLanguage = request.detectedLanguage;

      if (detectedLanguage) {
        languageDropdown.value = detectedLanguage;
        chrome.storage.local.set({ selectedLanguage: detectedLanguage });
      }
    }
  });

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "toggleCaptureButtons") {
      toggleCaptureButtons(false);
      chrome.storage.local.set({ capturingState: { isCapturing: false } })
    }
  });


});
