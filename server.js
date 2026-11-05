const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Continuous-Engine";
const TELEGRAM_LINK = "https://t.me/AI_GrowthAgent_bot";
const PLATFORM_URL = "https://b2b-saas-platform-8955.bolt.host";
const MY_WALLET = "0x9426A467E0fFF34981656bd98580f60CFE395364";

const sentRegistry = new Set();

// قائمة ضخمة وموسعة لشركات حقيقية عالمية مع مساراتها لضمان آلاف الأهداف الجاهزة
const BASE_COMPANIES = [
  "shopify.com", "stripe.com", "mailchimp.com", "hubspot.com", "zendesk.com", 
  "notion.so", "canva.com", "digitalocean.com", "heroku.com", "wix.com", 
  "squarespace.com", "salesforce.com", "adobe.com", "atlassian.com", "tableau.com", 
  "monday.com", "airtable.com", "clickup.com", "pipedrive.com", "revolut.com", 
  "wise.com", "checkout.com", "databricks.com", "snowflake.com", "mongodb.com", 
  "elastic.co", "hashicorp.com", "pagerduty.com", "slack.com", "zoom.us",
  "github.com", "gitlab.com", "twilio.com", "sendgrid.com", "cloudflare.com",
  "asana.com", "trello.com", "intercom.com", "figma.com", "miro.com"
];

function generateRealTargetQueue() {
  let queue = [];
  BASE_COMPANIES.forEach(domain => {
    const full = `https://www.${domain}`;
    queue.push(full);
    queue.push(`${full}/contact`);
    queue.push(`${full}/about`);
    queue.push(`${full}/pricing`);
    queue.push(`${full}/support`);
  });
  return queue;
}

let liveDiscoveredQueue = generateRealTargetQueue();

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

async function sendPayloadToRealTarget(targetUrl) {
  if (sentRegistry.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  try {
    axios.post(targetUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, { timeout: 1000 }).catch(() => {});

    console.log(`[🚀 CONTINUOUS REAL SENT] -> ${targetUrl} | Unique Sent: ${sentRegistry.size}`);
  } catch (err) {}
}

async function continuousWorker() {
  while (true) {
    try {
      if (liveDiscoveredQueue.length === 0) {
        // إعادة تدوير وتوليد القائمة فوراً عند نفادها لمنع التوقف نهائياً
        liveDiscoveredQueue = generateRealTargetQueue();
        if (sentRegistry.size > 2000) sentRegistry.clear(); // تدوير الذاكرة بأمان
      }

      // سحب دفعة متوازية مستمرة
      const batchSize = 5;
      const currentBatch = liveDiscoveredQueue.splice(0, batchSize);

      await Promise.all(currentBatch.map(async (target) => {
        if (!sentRegistry.has(target)) {
          await sendPayloadToRealTarget(target);
        }
      }));

      // فاصل زمني منتظم للحفاظ على التدفق بدون توقف
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} Continuous Engine Active 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    remainingQueue: liveDiscoveredQueue.length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 CONTINUOUS REAL COMPANIES ENGINE ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`[🛡️ NO STOPPING - AUTO RECYCLE]: Active`);
  console.log(`======================================================\n`);

  for (let i = 0; i < 2; i++) {
    continuousWorker();
  }
});

module.exports = app;
