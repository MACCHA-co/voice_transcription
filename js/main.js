const clientId = "0t9h8td1qfp8phhcen3hd6jaghnafs";
const redirectUri = "https://MACCHA-co.github.io/voice_transcription/callback.html";
const channel = "ryokumacha";

let accessToken = localStorage.getItem("twitch_token");
let twitchUsername = localStorage.getItem("twitch_username");

const loginBtn = document.getElementById("loginBtn");
const sendBtn  = document.getElementById("sendBtn");
const textDiv  = document.getElementById("text");

// Twitchにログイン
loginBtn.onclick = () => {
  const url =
    "https://id.twitch.tv/oauth2/authorize" +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_type=token" +
    "&scope=chat:read+chat:edit";

  location.href = url;
};

// 音声認識
const recognition = new webkitSpeechRecognition();
recognition.lang = "ja-JP";
recognition.continuous = true;

recognition.onresult = (e) => {
  textDiv.innerText =
    e.results[e.results.length - 1][0].transcript;
};

recognition.start();

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
