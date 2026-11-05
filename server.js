const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

// 🛡️ حماية شاملة ضد أي كراش أو خطأ مفاجئ على مستوى السيرفر
process.on('uncaughtException', (err) => {
  console.error('[⚠️ SYSTEM WARNING - UNCAUGHT EXCEPTION]:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[⚠️ SYSTEM WARNING - UNHANDLED REJECTION]:', reason);
});

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Omni-Source-Engine-v9";
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
// 📋 الذاكرة الذكية وطابور المهام متعدد المصادر
// -------------------------------------------------------------
const sentRegistry = new Set();
const badDomains = new Set();
let workQueue = [];

const SEARCH_VECTORS = [
  "top b2b saas companies contact", "global software development agency",
  "cloud infrastructure providers", "fintech startup solution contact",
  "enterprise marketing software", "ai automation tech company",
  "cybersecurity enterprise solutions", "devops tools official partner",
  "data analytics platform contact", "payment gateway provider support",
  "hr tech software startup", "erp software provider official",
  "logistics platform contact page", "edtech enterprise solutions"
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

function seedCoreQueue() {
  let list = [];
  MASTER_COMPANIES.forEach(d => {
    const root = `https://www.${d}`;
    list.push(root, `${root}/contact`, `${root}/about`, `${root}/pricing`, `${root}/sales`, `${root}/support`);
  });
  
  // توليد أهداف إضافية ضخمة لضمان الامتلاء الدائم
  for (let i = 1; i <= 600; i++) {
    list.push(`https://www.enterprise-global-solution-${i}.com/contact`);
    list.push(`https://www.cloud-saas-platform-${i}.io/support`);
  }
  return list;
}

workQueue = seedCoreQueue();

// -------------------------------------------------------------
// 🌐 المصدر الأول: البحث الحي من محركات بحث متعددة
// -------------------------------------------------------------
async function fetchFromSearchEngines() {
  const query = SEARCH_VECTORS[Math.floor(Math.random() * SEARCH_VECTORS.length)];
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0' },
      timeout: 3000
    });

    const $ = cheerio.load(res.data);
    let count = 0;
    $('.result__url').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const origin = new URL(href).origin;
          if (!origin.includes('duckduckgo') && !origin.includes('wikipedia') && !sentRegistry.has(origin) && !badDomains.has(origin)) {
            workQueue.push(origin, `${origin}/contact`, `${origin}/support`);
            count++;
          }
        } catch (e) {}
      }
    });
    if (count > 0) console.log(`[🔎 MULTI-SOURCE SEARCH] Added ${count} targets from: "${query}"`);
  } catch (e) {}
}

// -------------------------------------------------------------
// 🌐 المصدر الثاني: جلب روابط من مستودعات تقنية عامة (Open Directories)
// -------------------------------------------------------------
async function fetchFromOpenDirectories() {
  try {
    // جلب قائمة عشوائية من شركات التكنولوجيا من قوائم عامة جاهزة
    const res = await axios.get('https://raw.githubusercontent.com/fivedollar/fivedollar-saas-ideas/master/README.md', { timeout: 3000 });
    const matches = res.data.match(/https?:\/\/[^\s)]+/g) || [];
    let added = 0;
    matches.forEach(url => {
      try {
        const origin = new URL(url).origin;
        if (!sentRegistry.has(origin) && !badDomains.has(origin) && added < 30) {
          workQueue.push(origin, `${origin}/contact`);
          added++;
        }
      } catch (e) {}
    });
    if (added > 0) console.log(`[📂 OPEN DIRECTORY] Pulled ${added} active tech domains.`);
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
// ✉️ إرسال البيانات بسرعة فائقة ومعالجة الأخطاء
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
      timeout: 1000
    });

    console.log(`[🚀 OMNI-SOURCE SENT] -> ${targetUrl} | Total Unique Sent: ${sentRegistry.size}`);
  } catch (err) {
    badDomains.add(targetUrl);
    if (badDomains.size > 8000) badDomains.clear();
  }
}

// -------------------------------------------------------------
// ⚡ العمال الأقوياء (Multi-Source Workers Loop)
// -------------------------------------------------------------
async function runOmniWorker(workerId) {
  while (true) {
    try {
      // لو الطابور قل عن 100 عنصر، يتم جلب البيانات من كافة المصادر بالتوازي
      if (workQueue.length < 100) {
        workQueue.push(...seedCoreQueue());
        // تشغيل المصادر المختلفة في الخلفية بدون أي بلوك
        fetchFromSearchEngines().catch(() => {});
        fetchFromOpenDirectories().catch(() => {});
      }

      if (sentRegistry.size > 40000) sentRegistry.clear();

      const target = workQueue.shift();
      if (target) {
        await dispatchPayload(target);
      }

      // سرعة فائقة مستقرة لا تستهلك الـ CPU وتمنع الكراش
      await new Promise(r => setTimeout(r, 45));
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} ALL SOURCES ACTIVE 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    queueSize: workQueue.length,
    blockedCount: badDomains.size
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 OMNI-SOURCE ENGINE v9 - ALL SOURCES & UNSTOPPABLE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`======================================================\n`);

  // تشغيل 4 عمال صواريخ يسحبون من كافة المصادر بلا توقف 24/7
  for (let i = 1; i <= 4; i++) {
    runOmniWorker(i).catch(err => {
      console.log(`[⚠️ Worker ${i} Auto-Recovered]:`, err.message);
    });
  }
});

module.exports = app;
