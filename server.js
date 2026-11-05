const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Turbo-Beast-Engine";
const TELEGRAM_LINK = "https://t.me/AI_GrowthAgent_bot";
const PLATFORM_URL = "https://b2b-saas-platform-8955.bolt.host";
const MY_WALLET = "0x9426A467E0fFF34981656bd98580f60CFE395364";

const sentRegistry = new Set();

const BASE_COMPANIES = [
  "shopify.com", "stripe.com", "mailchimp.com", "hubspot.com", "zendesk.com", 
  "notion.so", "canva.com", "digitalocean.com", "heroku.com", "wix.com", 
  "squarespace.com", "salesforce.com", "adobe.com", "atlassian.com", "tableau.com", 
  "monday.com", "airtable.com", "clickup.com", "pipedrive.com", "revolut.com", 
  "wise.com", "checkout.com", "databricks.com", "snowflake.com", "mongodb.com", 
  "elastic.co", "hashicorp.com", "pagerduty.com", "slack.com", "zoom.us",
  "github.com", "gitlab.com", "twilio.com", "sendgrid.com", "cloudflare.com",
  "asana.com", "trello.com", "intercom.com", "figma.com", "miro.com",
  "openai.com", "anthropic.com", "vercel.com", "netlify.com", "supabase.com"
];

function generateTurboQueue() {
  let queue = [];
  BASE_COMPANIES.forEach(domain => {
    const full = `https://www.${domain}`;
    queue.push(full);
    queue.push(`${full}/contact`);
    queue.push(`${full}/about`);
    queue.push(`${full}/pricing`);
    queue.push(`${full}/support`);
    queue.push(`${full}/sales`);
    queue.push(`${full}/enterprise`);
  });
  return queue;
}

let turboQueue = generateTurboQueue();

const marketingData = {
  subject: `[مهم] تحديث منصة الذكاء الاصطناعي B2B المؤسسية`,
  senderName: "منظومة B2B Enterprise SaaS",
  messageBody: `
مرحباً بكم،
نود إعلامكم بتحديث الرابط الرسمي لمنصة الذكاء الاصطناعي المؤسسية الجديدة لمضاعفة الأرباح وأتمتة العمليات.

🌐 رابط المنصة: ${PLATFORM_URL}
💳 الاشتراك: $200 USD شهرياً عبر محفظة BNB: ${MY_WALLET}
🔗 التليجرام: ${TELEGRAM_LINK}
  `.trim()
};

async function turboSend(targetUrl) {
  if (sentRegistry.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  try {
    axios.post(targetUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, { timeout: 600 }).catch(() => {});

    console.log(`[🚀 TURBO BLAST SENT] -> ${targetUrl} | Total Unique Sent: ${sentRegistry.size}`);
  } catch (err) {}
}

// ⚡ عمال بلا راحة (Infinite Turbo Workers)
async function startTurboWorker(workerId) {
  while (true) {
    try {
      if (turboQueue.length === 0) {
        turboQueue = generateTurboQueue();
        if (sentRegistry.size > 5000) sentRegistry.clear();
      }

      // سحب دفعة ضخمة وإرسالها فوراً بالتوازي التام دون أي انتظار
      const batch = turboQueue.splice(0, 15);
      await Promise.all(batch.map(target => turboSend(target)));

    } catch (e) {
      // استمرار فوري بدون توقف في حال حدوث أي خطأ
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} TURBO BEAST ACTIVE 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    queueLeft: turboQueue.length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 TURBO BEAST ENGINE - NO REST / MAX SPEED ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`======================================================\n`);

  // تشغيل 4 عمال بأسلوب "كربكة" لا يتوقف أبداً في الخلفية
  for (let i = 1; i <= 4; i++) {
    startTurboWorker(i);
  }
});

module.exports = app;
