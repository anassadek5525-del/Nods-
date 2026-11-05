const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Ultimate-Omni-Beast-v4";
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
// 📋 الذاكرة الذكية ونظام الحماية ومنع التكرار والأخطاء
// -------------------------------------------------------------
const sentRegistry = new Set();
const failedDomains = new Set();
let liveQueue = [];

const SEARCH_VECTORS = [
  "top b2b saas companies contact", "global software engineering platform",
  "cloud infrastructure providers", "fintech startup solution contact",
  "enterprise marketing software", "ai automation tech company",
  "ecommerce solutions provider", "cybersecurity platform enterprise",
  "crm software provider contact", "devops tools company official",
  "data analytics platform", "payment gateway provider",
  "hr software solutions", "erp software provider",
  "logistics tech platform", "edtech startup enterprise",
  "healthcare software provider", "real estate tech platform",
  "legal tech software", "blockchain development company"
];

const MASTER_COMPANIES = [
  "shopify.com", "stripe.com", "mailchimp.com", "hubspot.com", "zendesk.com", 
  "notion.so", "canva.com", "digitalocean.com", "heroku.com", "wix.com", 
  "squarespace.com", "salesforce.com", "adobe.com", "atlassian.com", "tableau.com", 
  "monday.com", "airtable.com", "clickup.com", "pipedrive.com", "revolut.com", 
  "wise.com", "checkout.com", "databricks.com", "snowflake.com", "mongodb.com", 
  "elastic.co", "hashicorp.com", "pagerduty.com", "slack.com", "zoom.us",
  "github.com", "gitlab.com", "twilio.com", "sendgrid.com", "cloudflare.com",
  "openai.com", "anthropic.com", "vercel.com", "netlify.com", "supabase.com",
  "box.com", "asana.com", "trello.com", "intercom.com", "figma.com", "miro.com"
];

function buildUltimateQueue() {
  let q = [];
  MASTER_COMPANIES.forEach(d => {
    const f = `https://www.${d}`;
    q.push(f, `${f}/contact`, `${f}/about`, `${f}/pricing`, `${f}/support`, `${f}/sales`, `${f}/enterprise`);
  });

  // حقن آلاف الأهداف الديناميكية الاحتياطية لضمان التدفق اللا نهائي
  for (let i = 1; i <= 1000; i++) {
    q.push(`https://www.enterprise-global-lead-${i}.com/contact`);
    q.push(`https://www.cloud-saas-infrastructure-${i}.io/support`);
  }
  return q;
}

liveQueue = buildUltimateQueue();

// -------------------------------------------------------------
// 🔎 نظام البحث الحي مع محاكاة المتصفح لتجاوز الحظر
// -------------------------------------------------------------
async function fetchLiveLeadsWeb() {
  const query = SEARCH_VECTORS[Math.floor(Math.random() * SEARCH_VECTORS.length)];
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 3000
    });

    const $ = cheerio.load(response.data);
    $('.result__url').each((i, el) => {
      let rawUrl = $(el).attr('href');
      if (rawUrl) {
        try {
          const parsed = new URL(rawUrl);
          const domain = parsed.origin;
          
          if (!domain.includes('duckduckgo') && !domain.includes('wikipedia') && !sentRegistry.has(domain) && !failedDomains.has(domain)) {
            liveQueue.push(domain);
            liveQueue.push(`${domain}/contact`);
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

// -------------------------------------------------------------
// 🛡️ معالجة الأخطاء الفائقة (Self-Healing & WAF Bypass)
// -------------------------------------------------------------
async function sendUltimatePayload(targetUrl) {
  if (sentRegistry.has(targetUrl) || failedDomains.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  try {
    await axios.post(targetUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36',
        'Content-Type': 'application/json'
      },
      timeout: 700 // سرعة خاطفة مع مهلة قصيرة لمنع أي تعليق
    });

    console.log(`[🚀 ULTIMATE SUCCESS] -> ${targetUrl} | Total Sent: ${sentRegistry.size}`);
  } catch (err) {
    // عزل الموقع المعطل أو المحظور فوراً والمتابعة بدون إبطاء
    failedDomains.add(targetUrl);
    if (failedDomains.size > 8000) failedDomains.clear();
  }
}

// -------------------------------------------------------------
// ⚡ محرك الصواريخ الخماسي المتوازي (8 عمال فائقي السرعة)
// -------------------------------------------------------------
async function ultimateWorker(id) {
  while (true) {
    try {
      // إعادة التعبئة التلقائية الفورية لو الطابور قل عن الحد الأدنى
      if (liveQueue.length < 50) {
        liveQueue.push(...buildUltimateQueue());
        fetchLiveLeadsWeb().catch(() => {});
      }

      // تنظيف הذاكرة (RAM) أوتوماتيكياً للحفاظ على القوة القصوى للأبد
      if (sentRegistry.size > 50000) {
        sentRegistry.clear();
      }

      // سحب دفعة ضخمة (40 هدف لكل عامل في نفس الميكروثانية)
      const batchSize = 40;
      const currentBatch = liveQueue.splice(0, batchSize);

      await Promise.all(currentBatch.map(target => sendUltimatePayload(target)));

    } catch (e) {
      // استمرار مطلق بلا توقف تحت أي ظرف
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} ULTIMATE BEAST ACTIVE 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    queueRemaining: liveQueue.length,
    failedDomainsBlocked: failedDomains.size
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 ULTIMATE OMNI-BEAST v4 - UNSTOPPABLE 24/7 ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`======================================================\n`);

  // تشغيل 8 عمال صواريخ للعمل بأقصى طاقة في الكون
  for (let i = 1; i <= 8; i++) {
    ultimateWorker(i);
  }
});

module.exports = app;
