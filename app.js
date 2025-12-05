==============================
 Twitch OAuth 設定
==============================
const clientId = "あなたのClient ID";
const redirectUri = "https://あなたのドメイン/callback.html";
let accessToken = null;
let username = null;

Twitchログイン
document.getElementById("loginBtn").onclick = () => {
  const url =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=token` +
    `&scope=chat:read+chat:edit`;

  window.location.href = url;
};

URL からアクセストークンを取得
if (window.location.hash.includes("access_token")) {
  accessToken = window.location.hash.match(/access_token=([^&]+)/)[1];
  fetch("https://api.twitch.tv/helix/users", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Client-Id": clientId
    }
  })
  .then(res => res.json())
  .then(data => {
    username = data.data[0].login;
    document.getElementById("user").textContent = `Logged in as: ${username}`;

    // tmi.js クライアント初期化
    initTmiClient();
  });
}


==============================
 Twitch Chat 送信用 tmi.js
==============================
let client;

function initTmiClient() {
  client = new tmi.Client({
    options: { debug: true },
    identity: {
      username: username,
      password: "oauth:" + accessToken
    },
    channels: ["あなたの配信チャンネル名"] // コメント投稿先
  });

  client.connect();
}

// コメント送信ボタン
document.getElementById("sendBtn").onclick = () => {
  if (!client) return alert("ログインして下さい");

  const msg = document.getElementById("result").textContent;
  client.say("あなたの配信チャンネル名", msg);
};


// ==============================
//   音声認識（Web Speech API）
// ==============================
const micBtn = document.getElementById("micBtn");
const resultBox = document.getElementById("result");

let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = event => {
    resultBox.textContent = event.results[0][0].transcript;
  };
}

micBtn.onclick = () => {
  recognition.start();
};

