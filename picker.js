// picker.js

let tokenClient;
let gapiInited = false;
let gisInited = false;
let accessToken = null;
let currentFileId = null;

let loginButton;// = document.getElementById('login');
let pickButton;// = document.getElementById('pick');
let refreshButton;

document.addEventListener('DOMContentLoaded', () => {
    pickButton = document.getElementById('pick');
    pickButton.disabled = true;

    loginButton = document.getElementById('login')
    loginButton.disabled = true;

    const token = localStorage.getItem('accessToken');
    console.log(token);

    refreshButton = document.getElementById('refresh');

    if(token) {
        gapiLoaded();
        gisLoaded();

        gapiInited = true;
        gisInited = true;

        gapi.load('client:picker', () => {
            gapi.client.init({ apiKey: CONFIG.API_KEY }).then(() => {
                gapi.client.setToken({ access_token: token });

                loginButton.style.display = 'none';
                pickButton.style.display = 'inline-block';
                pickButton.disabled = false;
            });
        });
   
        loginButton.style.display = 'none';
        pickButton.style.display = 'inline-block';
        pickButton.disabled = false;
    }

    loginButton.addEventListener('click', () => {
        tokenClient.callback = (resp) => {
            if (resp.error !== undefined) {
                throw resp;
            }

            accessToken = resp.access_token;
            localStorage.setItem('accessToken', accessToken);

            loginButton.style.display = 'none';
            pickButton.style.display = 'inline-block';
            pickButton.disabled = false;
        };

        tokenClient.requestAccessToken({ prompt: 'consent' });
    });

    pickButton.addEventListener('click', () => {
        console.log(token)
        if(!accessToken && !token){
            console.error("No access token");
            return;
        }
        

        const picker = new google.picker.PickerBuilder()
            .addView(google.picker.ViewId.DOCS)
            .setOAuthToken(gapi.client.getToken().access_token)
            .setDeveloperKey(CONFIG.API_KEY)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);

        
        // tokenClient.requestAccessToken({ prompt: '' });
    });

    // 入力値に応じてリアルタイムで幅変更
    document.getElementById('charsPerLine').addEventListener('input', () => {
        console.log("リアルタイム反映")
        const chars = parseInt(document.getElementById('charsPerLine').value, 10);
        if (!isNaN(chars)) {
            viewer.style.height = `${chars}ch`;
        }
    });

    refreshButton.addEventListener('click', ()=>{
        if (!currentFileId) return;

        gapi.client.drive.files.get({
            fileId: currentFileId,
            alt: 'media'
        }).then(response => {
            viewer.textContent = response.body;

            const chars = parseInt(document.getElementById('charsPerLine').value, 10);
            if (!isNaN(chars)) {
                console.log(chars)
                viewer.style.height = `${chars}ch`;
            }
        });
    });

    // ボタン取得後に初期化チェック
    maybeEnableButton();
});

function gapiLoaded() {
    gapi.load('client:picker', initializePicker);
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: '',
    });
    gisInited = true;
    maybeEnableButton();
}

function initializePicker() {
    gapi.client.init({
        apiKey: CONFIG.API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(() => {
        gapiInited = true;
        maybeEnableButton();
    });
}

function maybeEnableButton() {
    if (gapiInited && gisInited && loginButton) {
        loginButton.disabled = false;
    }
}

function pickerCallback(data) {
    if (data.action === google.picker.Action.PICKED) {
        const file = data.docs[0];
        const fileId = file.id;
        currentFileId = fileId;

        localStorage.setItem('lastOpenedFileId', fileId);
        loadFileById(fileId)
    } else {
        console.warn('ファイルが選択されていないか、無効なレスポンスでした:', data);
    }
}

function loadFileById(fileId) {
    gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
    }).then(response => {
        const viewer = document.getElementById('viewer');
        viewer.textContent = response.body;
        // 文字数設定に従って幅を設定
        const charsPerLine = parseInt(document.getElementById('charsPerLine').value, 10) || 33;
        viewer.style.height = `${charsPerLine}ch`;
        localStorage.setItem('lastOpenedFileId', fileId);
    }, error => {
        console.error('ファイル読み込みエラー:', error);
    });
}

// 初期化用コールバックを登録
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;
