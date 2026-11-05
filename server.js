const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Titan-Engine-RateLimited";
const TELEGRAM_LINK = "https://t.me/AI_GrowthAgent_bot";
const PLATFORM_URL = "https://b2b-saas-platform-8955.bolt.host";
const MY_WALLET = "0x9426A467E0fFF34981656bd98580f60CFE395364";

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
// 📋 إدارة الذاكرة الخفيفة (Low-RAM Footprint)
// -------------------------------------------------------------
const sentRegistry = new Set();
const badDomains = new Set();
let workQueue = [];

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

// توليد خفيف ومحدد لحماية الـ RAM
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
    const keywords = ["b2b saas contact", "fintech startup contact", "cloud software company"];
    const q = keywords[Math.floor(Math.random() * keywords.length)];

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
🔗 التليجرام: ${TELEGRAM_LINK}
  `.trim()
};

async function dispatchPayload(targetUrl) {
  if (sentRegistry.has(targetUrl) || badDomains.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  try {
    axios.post(targetUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/125.0.0.0', 'Content-Type': 'application/json' },
      timeout: 1500
    }).catch(() => {});

    if (sentRegistry.size % 50 === 0) {
      console.log(`[🚀 RATE-CONTROLLED SENT] -> Total Sent: ${sentRegistry.size} | Target Rate: 3,000/hr`);
    }
  } catch (err) {
    badDomains.add(targetUrl);
  }
}

// -------------------------------------------------------------
// ⚡ Worker Loop محدد المعدل (3,000/الساعة بالضبط)
// -------------------------------------------------------------
async function runTargetedRateWorker(workerId) {
  while (true) {
    try {
      if (workQueue.length < 20) {
        workQueue.push(...refillQueueControlled());
        scrapeLiveWebLeads().catch(() => {});
      }

      // تنظيف الذاكرة للحفاظ على استهلاك الـ RAM منخفضاً دائماً
      if (sentRegistry.size > 5000) sentRegistry.clear();
      if (badDomains.size > 2000) badDomains.clear();

      const target = workQueue.shift();
      if (target) {
        await dispatchPayload(target);
      }

      // فاصل زمني 2,400 ملي ثانية لكل عامل (عاملين = رسالة كل 1,200 ملي ثانية = 3,000 رسالة/ساعة)
      await new Promise(r => setTimeout(r, 2400));
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} ONLINE 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    queueRemaining: workQueue.length,
    hourlyTarget: 3000
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 TITAN-ENGINE - STABLE 3,000 MSG/HR PER SERVER ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`======================================================\n`);

  // تشغيل عاملين اثنين فقط لتحقيق المعدل المطلوب بدقة وبدون استهلاك للذاكرة
  for (let i = 1; i <= 2; i++) {
    runTargetedRateWorker(i);
  }
});

module.exports = app;
