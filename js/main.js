const clientId = "0t9h8td1qfp8phhcen3hd6jaghnafs";
const redirectUri = "https://MACCHA-co.github.io/voice_transcription/callback.html";
const channel = "ryokumacha"; //ここをチャンネル名に変更

let accessToken = null;
let broadcasterId = null;
let senderId = null;

async function getUserIdByLogin(loginName) {
  const res = await fetch(
    `https://api.twitch.tv/helix/users?login=${loginName}`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Client-Id": clientId
      }
    }
  );
  const data = await res.json();
  return data.data[0].id;
}

// Twitchにログイン
document.getElementById("loginBtn").onclick = () => {
  const url =
    "https://id.twitch.tv/oauth2/authorize" +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_type=token" +
    "&scope=user:write:chat";

  location.href = url;
};
if (!localStorage.getItem("twitch_token_cleared")) {
  localStorage.removeItem("twitch_token");
  localStorage.setItem("twitch_token_cleared", "true");
}
// ==============================
//  OAuthトークン取得
// ==============================
accessToken = localStorage.getItem("twitch_token");
if (location.hash.includes("access_token")) {
  const params = new URLSearchParams(location.hash.substring(1));
  accessToken = params.get("access_token");

  // token保存
  localStorage.setItem("twitch_token", accessToken);
  getUserInfo();
}

if (accessToken && !broadcasterId) {
  getUserInfo();
}
// ==============================
//  ユーザー情報取得
// ==============================
async function getUserInfo() {
  const res = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Client-Id": clientId
    }
  });
  const data = await res.json();
  const user = data.data[0];

  broadcasterId = await getUserIdByLogin(channel);
  senderId = user.id;

  document.getElementById("user").textContent =
    `Logged in as: ${user.login}`;

  document.getElementById("sendBtn").disabled = false;
}


// ==============================
//  音声認識
// ==============================
const micBtn = document.getElementById("micBtn");
const resultBox = document.getElementById("result");

const recognition = new webkitSpeechRecognition();
let isRecognizing=false

recognition.lang = "en-US";
recognition.interimResults = false;
recognition.continuous = true;
recognition.start();

recognition.onstart = () => {
  isRecognizing = true;
  console.log("🎙 音声認識スタート");
};

recognition.onend = () => {
  isRecognizing = false;
  console.log("🛑 音声認識終了");
};

micBtn.onclick = () => {
  if (isRecognizing) {
    recognition.stop();  // 一度止める
  } else {
    recognition.start(); // 再スタート
  }
};

let latestText = "";
recognition.onresult = e => {
  const last = e.results[e.results.length - 1];
  latestText = last[0].transcript.trim();
  if (!latestText) return;
  resultBox.textContent = latestText;
  console.log("認識:", latestText);
 };






// ==============================
//  コメント送信（Helix API）
// ==============================
document.getElementById("sendBtn").onclick = async () => {
  const message = resultBox.textContent;
  if (!message){
    console.log("送信内容が空です");
     return;
  }
  const res = await fetch(
    "https://api.twitch.tv/helix/chat/messages",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Client-Id": clientId,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        broadcaster_id: broadcasterId,
        sender_id: senderId,
        message: message
      })
    }
  );

  if (!res.ok) {
    console.error(await res.text());
    alert("送信失敗");
  } else {
    console.log(message);
  }
};
