==============================
 Twitch OAuth 設定
==============================
const clientId = "0t9h8td1qfp8phhcen3hd6jaghnafs";
const redirectUri = "https://MACCHA-co.github.io/voice_transcription/callback.html";
let accessToken = localStorage.getItem("twitch_token");
let username = localStorage.getItem("twitch_username");

document.getElementById("loginBtn").onclick = () => {
  const url =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=chat:read+chat:edit`;

  window.location.href = url;
};


// ==============================
// tmi.js
// ==============================
let client;

if (accessToken && username) {
  document.getElementById("user").textContent =
    `Logged in as: ${username}`;

  client = new tmi.Client({
    identity: {
      username,
      password: "oauth:" + accessToken
    },
    channels: [channel]
  });

  client.connect();
}

// コメント送信ボタン
document.getElementById("sendBtn").onclick = () => {
  if (!client) return alert("ログインして下さい");
  const msg = document.getElementById("result").textContent;
  if (msg) client.say(channel, msg);
};






