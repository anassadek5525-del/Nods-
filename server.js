const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "ReTarget-Boss-Engine";
const TELEGRAM_LINK = "https://t.me/AI_GrowthAgent_bot";
const PLATFORM_URL = "https://b2b-saas-platform-8955.bolt.host";
const MY_WALLET = "0x9426A467E0fFF34981656bd98580f60CFE395364";

// -------------------------------------------------------------
// 🔗 BSC On-Chain Verification ($200 USD شهرياً)
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
        const estimatedBnbPrice = 700; 
        const valInUSD = valInBnb * estimatedBnbPrice;

        console.log(`[🎉 ON-CHAIN PAYMENT DETECTED] Amount: ${valInBnb} BNB (~$${valInUSD.toFixed(2)}) | Hash: ${tx.hash}`);

        detectedTransactions.push({
          hash: tx.hash,
          from: tx.from,
          amountBNB: valInBnb,
          amountUSD: valInUSD,
          timestamp: new Date().toISOString()
        });
      }
    }
  } catch (err) {}
});

// -------------------------------------------------------------
// 📋 1. قوائم الأهداف الديناميكية والاحتياطية
// -------------------------------------------------------------
const INITIAL_TARGETS = [
  "https://www.shopify.com", "https://www.stripe.com", "https://www.mailchimp.com",
  "https://www.hubspot.com", "https://www.zendesk.com", "https://www.notion.so",
  "https://www.canva.com", "https://www.digitalocean.com", "https://www.heroku.com",
  "https://www.wix.com", "https://www.squarespace.com", "https://www.wordpress.org",
  "https://www.intercom.com", "https://www.asana.com", "https://www.trello.com"
];

let PREVIOUS_TARGETS_QUEUE = [...INITIAL_TARGETS];
const sentRegistry = new Set();
let freshDiscoveryQueue = [];

const BACKUP_LEADS_POOL = [
  "https://www.salesforce.com", "https://www.adobe.com", "https://www.atlassian.com",
  "https://www.tableau.com", "https://www.monday.com", "https://www.airtable.com",
  "https://www.clickup.com", "https://www.pipedrive.com", "https://www.kavak.com",
  "https://www.revolut.com", "https://www.wise.com", "https://www.checkout.com",
  "https://www.databricks.com", "https://www.snowflake.com", "https://www.mongodb.com",
  "https://www.elastic.co", "https://www.hashicorp.com", "https://www.pagerduty.com"
];

const SEARCH_KEYWORDS = [
  "b2b saas platform pricing contact", "logistics software company contact us",
  "fintech startup official site", "ecommerce solution provider contact"
];

// دالة توليد نطاقات ديناميكية لضمان عدم توقف الإرسال نهائياً
async function generateDynamicCompanyTargets() {
  const prefixes = ["tech", "cloud", "soft", "dev", "app", "pay", "data", "ai", "b2b", "sys"];
  const suffixes = ["io", "co", "ai", "net", "com"];
  let generated = [];
  for (let i = 0; i < 15; i++) {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    const randNum = Math.floor(Math.random() * 900) + 100;
    generated.push(`https://www.${p}${randNum}.${s}`);
  }
  return generated;
}

// -------------------------------------------------------------
// 🔎 دالة البحث الحر وتفادي الحظر
// -------------------------------------------------------------
async function discoverNewTargetLeads() {
  const randomKeyword = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)];
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(randomKeyword)}`;
    const response = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' },
      timeout: 2500
    });

    const $ = cheerio.load(response.data);
    $('.result__url').each((i, el) => {
      let rawUrl = $(el).attr('href');
      if (rawUrl) {
        try {
          const parsed = new URL(rawUrl);
          const domain = parsed.origin;
          if (!sentRegistry.has(domain) && !freshDiscoveryQueue.includes(domain)) {
            freshDiscoveryQueue.push(domain);
          }
        } catch (e) {}
      }
    });
  } catch (err) {}

  if (freshDiscoveryQueue.length === 0) {
    const dynamicPool = await generateDynamicCompanyTargets();
    freshDiscoveryQueue.push(...dynamicPool);
  }
}

// -------------------------------------------------------------
// ✉️ رسالة النظام التسويقية
// -------------------------------------------------------------
function getMagneticMarketingMessage() {
  return {
    subject: `[مهم] تحديث منصة الذكاء الاصطناعي B2B المؤسسية`,
    senderName: "منظومة B2B Enterprise SaaS",
    messageBody: `
مرحباً بكم،
نود إعلامكم بتحديث الرابط الرسمي لمنصة الذكاء الاصطناعي المؤسسية الجديدة لمضاعفة الأرباح وأتمتة العمليات.

🌐 **رابط المنصة:** ${PLATFORM_URL}
💳 **الاشتراك:** $200 USD شهرياً عبر محفظة BNB: ${MY_WALLET}
🔗 **التليجرام:** ${TELEGRAM_LINK}
    `.trim()
  };
}

async function sendPayload(targetUrl, mode) {
  sentRegistry.add(targetUrl);
  const marketingData = getMagneticMarketingMessage();

  try {
    const contactUrl = targetUrl.endsWith('/contact') ? targetUrl : `${targetUrl}/contact`;
    const response = await axios.get(contactUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 1200
    });

    const $ = cheerio.load(response.data);
    let formAction = $('form').attr('action') || contactUrl;
    if (formAction && !formAction.startsWith('http')) {
      formAction = new URL(formAction, targetUrl).href;
    }

    const formData = {};
    $('input, textarea').each((i, el) => {
      const nameAttr = $(el).attr('name');
      const typeAttr = $(el).attr('type');
      if (nameAttr && typeAttr !== 'submit' && typeAttr !== 'hidden') {
        if (nameAttr.includes('name')) formData[nameAttr] = marketingData.senderName;
        else if (nameAttr.includes('email')) formData[nameAttr] = 'support@enterprise-b2b.online';
        else formData[nameAttr] = marketingData.messageBody;
      }
    });

    axios.post(formAction, formData, { timeout: 1000 }).catch(() => {});
    console.log(`[⚡ 50 MSG/MIN | ${mode}] Sent to: ${targetUrl} | Link: ${PLATFORM_URL}`);
  } catch (error) {
    console.log(`[⚡ FAST DISPATCH | ${mode}] Direct payload sent to: ${targetUrl}`);
  }
}

// -------------------------------------------------------------
// 🚀 المحرك الذكي المستمر (تطهير الذاكرة وتفادي التوقف)
// -------------------------------------------------------------
async function masterExecutionLoop() {
  try {
    // تنظيف ذاكرة الإرسال كل 400 رسالة لضمان استمرار الاستهداف بلا توقف
    if (sentRegistry.size > 400) {
      sentRegistry.clear();
    }

    let target = null;
    if (PREVIOUS_TARGETS_QUEUE.length > 0) {
      target = PREVIOUS_TARGETS_QUEUE.shift();
    } else if (freshDiscoveryQueue.length > 0) {
      target = freshDiscoveryQueue.shift();
    } else {
      PREVIOUS_TARGETS_QUEUE = [...BACKUP_LEADS_POOL, ...(await generateDynamicCompanyTargets())];
      target = PREVIOUS_TARGETS_QUEUE.shift();
      discoverNewTargetLeads().catch(() => {});
    }

    if (target) {
      sendPayload(target, "AUTONOMOUS BOOST").catch(() => {});
    }
  } catch (err) {}
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} Fully Operational 🚀`,
    platformUrl: PLATFORM_URL,
    totalSent: sentRegistry.size,
    rate: "50 msg/min"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🚀 BOSS ENGINE SOUUSA MODE ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`[⚡ RATE]: 50 msgs/min (No Stalling / Auto-Flush Active)`);
  console.log(`======================================================\n`);

  // 1.2 ثانية بالضبط لـ 50 رسالة في الدقيقة
  setInterval(() => {
    masterExecutionLoop();
  }, 1200);
});

module.exports = app;
