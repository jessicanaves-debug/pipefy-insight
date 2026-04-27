"use strict";
const https = require("https");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const messages = req.body.messages || [];
    const apiKey = "AIzaSyBU0L8sGcnPzToWB7g0Yf10vo1-xALIg6w";
    const systemMsg = messages.find(function(m) { return m.role === "system"; });
    const userMsgs = messages.filter(function(m) { return m.role !== "system"; });

    const contents = userMsgs.map(function(m) {
      return { role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] };
    });

    const payload = { contents: contents, generationConfig: { temperature: 0.3, maxOutputTokens: 2048 } };
    if (systemMsg) payload.system_instruction = { parts: [{ text: systemMsg.content }] };

    const bodyStr = JSON.stringify(payload);
    const path = "/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    const data = await new Promise(function(resolve, reject) {
      const options = {
        hostname: "generativelanguage.googleapis.com",
        path: path,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(bodyStr) }
      };
      const reqHttp = https.request(options, function(resp) {
        let body = "";
        resp.on("data", function(chunk) { body += chunk; });
        resp.on("end", function() { resolve(JSON.parse(body)); });
      });
      reqHttp.on("error", reject);
      reqHttp.write(bodyStr);
      reqHttp.end();
    });

    if (data.error) throw new Error(data.error.message);
    const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : "";
    return res.status(200).json({ text: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
