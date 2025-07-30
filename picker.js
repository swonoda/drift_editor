let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;

window.addEventListener("load", () => {
  if (typeof google === "object" && google.accounts) {
    gisLoaded();
  } else {
    const interval = setInterval(() => {
      if (typeof google === "object" && google.accounts) {
        clearInterval(interval);
        gisLoaded();
      }
    }, 100);
  }

  if (typeof gapi !== "undefined") {
    gapiLoaded();
  } else {
    const interval2 = setInterval(() => {
      if (typeof gapi !== "undefined") {
        clearInterval(interval2);
        gapiLoaded();
      }
    }, 100);
  }
});

document.getElementById("pick").addEventListener("click", () => {
  if (!tokenClient) {
    alert("Googleログインの準備がまだできていません。少し待ってからもう一度押してね！");
    return;
  }
  if (accessToken) {
    createPicker();
  } else {
    tokenClient.requestAccessToken();
  }
});

function gapiLoaded() {
  gapi.load("client:picker", async () => {
    pickerInited = true;
    maybeEnablePicker();
  });
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error(tokenResponse);
        return;
      }
      accessToken = tokenResponse.access_token;
      maybeEnablePicker();
    },
  });
  gisInited = true;
}

function maybeEnablePicker() {
  if (pickerInited && accessToken) {
    createPicker();
  }
}

function createPicker() {
  const view = new google.picker.View(google.picker.ViewId.DOCS);
  view.setMimeTypes("text/plain");

  const picker = new google.picker.PickerBuilder()
    .setAppId(CONFIG.APP_ID || "")
    .setOAuthToken(accessToken)
    .addView(view)
    .setDeveloperKey(CONFIG.API_KEY)
    .setCallback(pickerCallback)
    .build();

  picker.setVisible(true);
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const fileId = data.docs[0].id;
    fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${CONFIG.API_KEY}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(response => {
        if (!response.ok) {
        throw new Error("📛 ファイルの取得に失敗しました（" + response.status + "）");
        }
        return response.text();
    })
    .then(text => {
        console.log("📖 ファイル内容取得成功");
        displayPages(text);
    })
    .catch(error => {
        console.error("❌ 読み込みエラー:", error);
        alert("ファイルの読み込みに失敗しました。形式が正しいか確認してください。");
    });
  }
}

window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;