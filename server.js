const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

// 🛡️ حماية شاملة ضد أي Crash مفاجئ على مستوى النظام التشغيلي
process.on('uncaughtException', (err) => {
  console.error('[⚠️ SYSTEM WARNING - UNCAUGHT EXCEPTION]:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[⚠️ SYSTEM WARNING - UNHANDLED REJECTION]:', reason);
});

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Unstoppable-Omni-Core-v7";
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
// 📋 الذاكرة الحية وإدارة الطابور ذاتية الشفاء
// -------------------------------------------------------------
const sentRegistry = new Set();
const badDomains = new Set();
let workQueue = [];

const SEARCH_QUERIES = [
  "top b2b saas companies contact", "global software development agency",
  "cloud infrastructure providers", "fintech startup solution contact",
  "enterprise marketing software", "ai automation tech company"
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

function seedQueue() {
  let list = [];
  MASTER_COMPANIES.forEach(d => {
    const root = `https://www.${d}`;
    list.push(root, `${root}/contact`, `${root}/about`, `${root}/pricing`, `${root}/sales`, `${root}/support`);
  });
  
  for (let i = 1; i <= 300; i++) {
    list.push(`https://www.enterprise-global-lead-${i}.com/contact`);
  }
  return list;
}

workQueue = seedQueue();

// -------------------------------------------------------------
// 🔎 البحث الحي الآمن والمحصن
// -------------------------------------------------------------
async function scrapeFreshLeads() {
  if (workQueue.length > 500) return;
  const q = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  try {
    const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0' },
      timeout: 3000
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

// -------------------------------------------------------------
// ✉️ الإرسال الآمن المعالج للأخطاء الفردية
// -------------------------------------------------------------
async function dispatchPayload(targetUrl) {
  if (sentRegistry.has(targetUrl) || badDomains.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  try {
    await axios.post(targetUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0.0.0', 'Content-Type': 'application/json' },
      timeout: 1200
    });

    console.log(`[🚀 UNSTOPPABLE SENT] -> ${targetUrl} | Total Unique Sent: ${sentRegistry.size}`);
  } catch (err) {
    badDomains.add(targetUrl);
  }
}

// -------------------------------------------------------------
// ⚡ العمال الأقوياء مع نظام مراقبة وإعادة إحياء ذاتي (Self-Healing Workers)
// -------------------------------------------------------------
async function runProtectedWorker(workerId) {
  while (true) {
    try {
      if (workQueue.length < 40) {
        workQueue.push(...seedQueue());
        scrapeFreshLeads().catch(() => {});
      }

      // تنظيف הذاكرة بذكاء لمنع أي تكدس
      if (sentRegistry.size > 25000) sentRegistry.clear();
      if (badDomains.size > 5000) badDomains.clear();

      const target = workQueue.shift();
      if (target) {
        await dispatchPayload(target);
      }

      // فاصل زمني مثالي يحقق سرعة صاروخية مستقرة تماماً وبدون أي استهلاك ضار للـ CPU
      await new Promise(r => setTimeout(r, 60));
    } catch (e) {
      // لو حصل أي خطأ عرضي، العامل بياخد نفس صغير ويكمل لوحده فورا
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} UNSTOPPABLE 24/7 ACTIVE 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    queueSize: workQueue.length,
    blockedCount: badDomains.size
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 UNSTOPPABLE OMNI-CORE v7 - 24/7 BULLETPROOF ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`======================================================\n`);

  // تشغيل 4 عمال محصنين بالكامل للعمل بانتظام دائم
  for (let i = 1; i <= 4; i++) {
    runProtectedWorker(i).catch(err => {
      console.log(`[⚠️ Worker ${i} Restarted Automatically]:`, err.message);
    });
  }
});

module.exports = app;
