const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Stable-Beast-v5";
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
        const valInUSD = valInBnb * 700;
        console.log(`[🎉 ON-CHAIN PAYMENT] Amount: ${valInBnb} BNB (~$${valInUSD.toFixed(2)})`);
        detectedTransactions.push({ hash: tx.hash, amountUSD: valInUSD, timestamp: new Date().toISOString() });
      }
    }
  } catch (err) {}
});

// -------------------------------------------------------------
// 📋 الذاكرة الآمنة وإدارة الطابور
// -------------------------------------------------------------
const sentRegistry = new Set();
const failedDomains = new Set();
let liveQueue = [];

const SEARCH_VECTORS = [
  "top b2b saas companies contact", "global software engineering platform",
  "cloud infrastructure providers", "fintech startup solution contact",
  "enterprise marketing software", "ai automation tech company",
  "ecommerce solutions provider", "cybersecurity platform enterprise"
];

const MASTER_COMPANIES = [
  "shopify.com", "stripe.com", "mailchimp.com", "hubspot.com", "zendesk.com", 
  "notion.so", "canva.com", "digitalocean.com", "heroku.com", "wix.com", 
  "squarespace.com", "salesforce.com", "adobe.com", "atlassian.com", "tableau.com", 
  "monday.com", "airtable.com", "clickup.com", "pipedrive.com", "revolut.com", 
  "wise.com", "checkout.com", "databricks.com", "snowflake.com", "mongodb.com", 
  "elastic.co", "hashicorp.com", "pagerduty.com", "slack.com", "zoom.us",
  "github.com", "gitlab.com", "twilio.com", "sendgrid.com", "cloudflare.com",
  "openai.com", "anthropic.com", "vercel.com", "netlify.com", "supabase.com"
];

function buildStableQueue() {
  let q = [];
  MASTER_COMPANIES.forEach(d => {
    const f = `https://www.${d}`;
    q.push(f, `${f}/contact`, `${f}/about`, `${f}/pricing`, `${f}/support`, `${f}/sales`, `${f}/enterprise`);
  });

  for (let i = 1; i <= 300; i++) {
    q.push(`https://www.enterprise-lead-${i}.com/contact`);
  }
  return q;
}

liveQueue = buildStableQueue();

// -------------------------------------------------------------
// 🔎 البحث الحي الآمن
// -------------------------------------------------------------
async function fetchSafeLeads() {
  const query = SEARCH_VECTORS[Math.floor(Math.random() * SEARCH_VECTORS.length)];
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0' },
      timeout: 3000
    });

    const $ = cheerio.load(response.data);
    $('.result__url').each((i, el) => {
      let rawUrl = $(el).attr('href');
      if (rawUrl) {
        try {
          const parsed = new URL(rawUrl);
          const domain = parsed.origin;
          if (!domain.includes('duckduckgo') && !sentRegistry.has(domain) && !failedDomains.has(domain)) {
            liveQueue.push(domain, `${domain}/contact`);
          }
        } catch (e) {}
      }
    });
  } catch (err) {}
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

async function sendSafePayload(targetUrl) {
  if (sentRegistry.has(targetUrl) || failedDomains.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  try {
    await axios.post(targetUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0', 'Content-Type': 'application/json' },
      timeout: 1000
    });

    console.log(`[🚀 STABLE SUCCESS] -> ${targetUrl} | Total Sent: ${sentRegistry.size}`);
  } catch (err) {
    failedDomains.add(targetUrl);
    if (failedDomains.size > 3000) failedDomains.clear();
  }
}

// 🛡️ محرك آمن ومستقر 24/7 (منع استهلاك الـ RAM/CPU المفاجئ)
async function stableWorker(id) {
  while (true) {
    try {
      if (liveQueue.length < 20) {
        liveQueue.push(...buildStableQueue());
        fetchSafeLeads().catch(() => {});
      }

      if (sentRegistry.size > 20000) sentRegistry.clear();

      // سحب دفعة متوازية معتدلة (15 هدف) مع فاصل زمني صغير لمنع الكراش
      const batch = liveQueue.splice(0, 15);
      await Promise.all(batch.map(target => sendSafePayload(target)));

      // فاصل زمني ميكروثاني خفيف يحافظ على سرعة ضخ هائلة ويمنع الـ Crash تماماً
      await new Promise(resolve => setTimeout(resolve, 350));

    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} STABLE 24/7 ACTIVE 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    queueRemaining: liveQueue.length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 STABLE BEAST ENGINE v5 - NO CRASH / 24/7 ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`======================================================\n`);

  // تشغيل 4 عمال متوازيين مستقرين
  for (let i = 1; i <= 4; i++) {
    stableWorker(i);
  }
});

module.exports = app;
