"use strict";
const https = require("https");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const query = req.body.query;
    const token = req.body.token;
    const bodyStr = JSON.stringify({ query: query });

    const data = await new Promise(function(resolve, reject) {
      const options = {
        hostname: "api.pipefy.com",
        path: "/graphql",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "Content-Length": Buffer.byteLength(bodyStr)
        }
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

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
