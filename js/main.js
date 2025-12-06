const clientId = "0t9h8td1qfp8phhcen3hd6jaghnafs";
const redirectUri = "https://MACCHA-co.github.io/voice-chat/callback.html";

let accessToken = null;

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

// チャット送信処理
document.getElementById("sendBtn").onclick = async () => {
  const message = textDiv.innerText;

  const userInfo = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Client-ID": clientId
    }
  }).then(r => r.json());

  const userId = userInfo.data[0].id;

  await fetch("https://api.twitch.tv/helix/chat/chatters", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Client-ID": clientId,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      broadcaster_id: userId,
      sender_id: userId,
      message: message
    })
  });

  alert("送信しました: " + message);
};
