const clientId = "0t9h8td1qfp8phhcen3hd6jaghnafs";
const redirectUri = "https://MACCHA-co.github.io/voice_transcription/callback.html";
const channel = "ryokumacha"
let accessToken = localStorage.getItem("twitch_token");
let twitchUsername = localStorage.getItem("twitch_username");

// Twitchにログイン
document.getElementById("loginBtn").onclick = () => {
  const authUrl = 
    "https://id.twitch.tv/oauth2/authorize" +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_type=token" +
    "&scope=chat:read+chat:edit";

  window.location = authUrl;
};

// 音声認識
const textDiv = document.getElementById("text");
const recognition = new webkitSpeechRecognition();
recognition.lang = "ja-JP";
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const t = event.results[event.results.length - 1][0].transcript;
  textDiv.innerText = t;
};

recognition.start();

// URLにアクセストークンがないか確認する
if (location.hash.includes("access_token")) {
  const hash = new URLSearchParams(location.hash.substr(1));
  accessToken = hash.get("access_token");

  document.getElementById("sendBtn").disabled = false;

  alert("ログイン成功！チャット送信できます。");
}

//チャット送信
if (accessToken && twitchUsername) {
  sendBtn.disabled = false;

  const client = new tmi.Client({
    identity: {
      username: twitchUsername,
      password: `oauth:${accessToken}`
    },
    channels: [channel]
  });

  client.connect();

  sendBtn.onclick = () => {
    if (textDiv.innerText) {
      client.say(channel, textDiv.innerText);
    }
  };
}
