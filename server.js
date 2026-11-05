const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Titan-Engine-Daemonic-Active";
const PLATFORM_URL = "https://b2b-saas-platform-8955.bolt.host";
const MY_WALLET = "0x9426A467E0fFF34981656bd98580f60CFE395364";

// 📱 بيانات بوت تيليجرام الجديد والـ Chat ID الخاص بك
const TELEGRAM_BOT_TOKEN = "9085667036:AAHjWViGOv227Pac38vlWZuvEFpATuqn84c";
const TELEGRAM_CHAT_ID = "8811809790"; 

// -------------------------------------------------------------
// 🔗 BSC On-Chain Verification
// -------------------------------------------------------------
const bscProvider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
let detectedTransactions = [];

bscProvider.on("block", async (blockNumber) => {
  try {
    const block = await bscProvider.getBlock(blockNumber, true);
    if (!block || !block.prefetchedTransactions) return;

    for (const tx of block.prefetchedTransactions) {
      if (tx.to && tx.to.toLowerCase() === MY_WALLET.toLowerCase()) {
        const valInBnb = parseFloat(ethers.formatEther(tx.value));
        const valInUSD = valInBnb * 700;
        console.log(`[🎉 ON-CHAIN PAYMENT] Amount: ${valInBnb} BNB (~$${valInUSD.toFixed(2)})`);
        detectedTransactions.push({ hash: tx.hash, amountUSD: valInUSD, timestamp: new Date().toISOString() });
      }
    }
  } catch (err) {}
});

// -------------------------------------------------------------
// 📋 الذاكرة الخفيفة
// -------------------------------------------------------------
const sentRegistry = new Set();
const badDomains = new Set();
let workQueue = [];

let welcomeMessageSent = false;
let nextMilestone = 3000; 

const CORE_DOMAINS = [
  "shopify.com", "stripe.com", "mailchimp.com", "hubspot.com", "zendesk.com", 
  "notion.so", "canva.com", "digitalocean.com", "heroku.com", "wix.com", 
  "squarespace.com", "salesforce.com", "adobe.com", "atlassian.com", "tableau.com", 
  "monday.com", "airtable.com", "clickup.com", "pipedrive.com", "revolut.com", 
  "wise.com", "checkout.com", "databricks.com", "snowflake.com", "mongodb.com", 
  "elastic.co", "hashicorp.com", "pagerduty.com", "slack.com", "zoom.us",
  "github.com", "gitlab.com", "twilio.com", "sendgrid.com", "cloudflare.com",
  "openai.com", "anthropic.com", "vercel.com", "netlify.com", "supabase.com"
];

const PREFIXES = ["get", "use", "try", "go", "app", "cloud", "tech", "dev", "ai", "data"];
const SUFFIXES = ["io", "co", "ai", "tech", "app", "cloud", "dev", "labs", "hq", "net"];

function refillQueueControlled() {
  let list = [];
  CORE_DOMAINS.forEach(d => {
    const root = `https://www.${d}`;
    list.push(root, `${root}/contact`);
  });

  PREFIXES.forEach(p => {
    SUFFIXES.forEach(s => {
      const domain = `https://www.${p}${s}.com`;
      list.push(domain, `${domain}/contact`);
    });
  });

  return list;
}

workQueue = refillQueueControlled();

async function scrapeLiveWebLeads() {
  try {
    const q = "b2b saas contact";
    const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0' },
      timeout: 2500
    });

    const $ = cheerio.load(res.data);
    $('.result__url').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const origin = new URL(href).origin;
          if (!origin.includes('duckduckgo') && !sentRegistry.has(origin) && !badDomains.has(origin)) {
            workQueue.push(origin, `${origin}/contact`);
          }
        } catch (e) {}
      }
    });
  } catch (e) {}
}

const marketingData = {
  subject: `[مهم] تحديث منصة الذكاء الاصطناعي B2B المؤسسية`,
  senderName: "منظومة B2B Enterprise SaaS",
  messageBody: `
مرحباً بكم،
نود إعلامكم بتحديث الرابط الرسمي لمنصة الذكاء الاصطناعي المؤسسية الجديدة لمضاعفة الأرباح وأتمتة العمليات.

🌐 رابط المنصة: ${PLATFORM_URL}
💳 الاشتراك: $200 USD شهرياً عبر محفظة BNB: ${MY_WALLET}
  `.trim()
};

async function sendTelegramAlert(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (err) {}
}

async function dispatchPayload(targetUrl) {
  if (sentRegistry.has(targetUrl) || badDomains.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  if (sentRegistry.size >= nextMilestone) {
    const reachedMilestone = nextMilestone;
    nextMilestone += 3000; 
    
    const alertMsg = `🚀 *إنجاز الساعة يا فنان!* \n\nالسيرفر أتم بنجاح إرسال **${reachedMilestone.toLocaleString()} رسالة** الأولى!\n🌐 رابط المنصة: ${PLATFORM_URL}`;
    sendTelegramAlert(alertMsg);
  }

  try {
    axios.post(targetUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/125.0.0.0', 'Content-Type': 'application/json' },
      timeout: 1500
    }).catch(() => {});

    if (sentRegistry.size % 25 === 0) {
      console.log(`[🔥 DAEMON-ACTIVE SENT] -> Total Sent: ${sentRegistry.size} | Core Locked`);
    }
  } catch (err) {
    badDomains.add(targetUrl);
  }
}

// 🛡️ عمال متعددة ومتوازية (4 Workers) قاعدين في قرابيس الماكينة مايناموش أبدآ
async function spawnDaemonWorker(workerId) {
  while (true) {
    try {
      if (workQueue.length < 20) {
        workQueue.push(...refillQueueControlled());
        setImmediate(() => scrapeLiveWebLeads().catch(() => {}));
      }

      if (sentRegistry.size > 200000) sentRegistry.clear();
      if (badDomains.size > 2000) badDomains.clear();

      const target = workQueue.shift();
      if (target) {
        await dispatchPayload(target);
      }

      // سرعة متوازنة تمنع الحظر وفي نفس الوقت تحافظ على استمرار الـ Loop
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} LOCKED & LOADED 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    queueRemaining: workQueue.length,
    nextMilestoneTarget: nextMilestone
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 TITAN-ENGINE - DAEMONIZED 4-WORKERS ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`======================================================\n`);

  // 🚀 إطلاق 4 عمال (Daemons) شغالين في الخلفية بشكل متوازي ولا نهائي عشان ميكنوش فرصة لأي توقف
  spawnDaemonWorker(1);
  spawnDaemonWorker(2);
  spawnDaemonWorker(3);
  spawnDaemonWorker(4);

  setTimeout(() => {
    if (!welcomeMessageSent) {
      welcomeMessageSent = true;
      const welcomeMsg = `👋 *أهلاً بك يا فنان Anas!* \n\nتم تفعيل النسخة الحديدية (**Daemonized Workers**).\n\n4 عمال متوازيين قاعدين في قلب سيرفرات الاستضافة ومش هيسيبوها تنام نهائياً، والعداد شغال يضرب في السقف للوصول لهدف الـ 3,000 وأنت حاطط رجل على رجل! 🚀🔥`;
      sendTelegramAlert(welcomeMsg);
    }
  }, 2000);
});

module.exports = app;
