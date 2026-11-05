const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Live-Search-Engine";
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
// 📋 قواعد البيانات الحية وسجل منع التكرار الصارم
// -------------------------------------------------------------
const sentRegistry = new Set();
let liveDiscoveredQueue = [];

// كلمات بحث متجددة لجلب أحدث الشركات والـ SaaS بصفة مستمرة
const SEARCH_QUERIES = [
  "top b2b saas companies contact us",
  "global software development agency contact",
  "cloud solutions provider official site",
  "fintech startup platform contact",
  "enterprise marketing software partners",
  "ai automation tech company contact"
];

// -------------------------------------------------------------
// 🔎 دالة البحث الحي لاستخراج شركات حقيقية من الويب
// -------------------------------------------------------------
async function scrapeRealCompaniesFromWeb() {
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' },
      timeout: 3000
    });

    const $ = cheerio.load(response.data);
    $('.result__url').each((i, el) => {
      let rawUrl = $(el).attr('href');
      if (rawUrl) {
        try {
          const parsed = new URL(rawUrl);
          const domain = parsed.origin;
          
          // فلترة دومينات محركات البحث ومواقع السوشيال لتبقى الشركات الحقيقية فقط
          if (!domain.includes('duckduckgo') && !domain.includes('wikipedia') && !sentRegistry.has(domain) && !liveDiscoveredQueue.includes(domain)) {
            liveDiscoveredQueue.push(domain);
          }
        } catch (e) {}
      }
    });
  } catch (err) {}
}

// قائمة احتياطية ضخمة من كبرى الشركات الحقيقية لضمان عدم توفر الطابور أبداً
const INITIAL_REAL_POOL = [
  "https://www.shopify.com", "https://www.stripe.com", "https://www.mailchimp.com",
  "https://www.hubspot.com", "https://www.zendesk.com", "https://www.notion.so",
  "https://www.canva.com", "https://www.digitalocean.com", "https://www.heroku.com",
  "https://www.wix.com", "https://www.squarespace.com", "https://www.salesforce.com",
  "https://www.adobe.com", "https://www.atlassian.com", "https://www.tableau.com",
  "https://www.monday.com", "https://www.airtable.com", "https://www.clickup.com",
  "https://www.pipedrive.com", "https://www.revolut.com", "https://www.wise.com",
  "https://www.checkout.com", "https://www.databricks.com", "https://www.snowflake.com",
  "https://www.mongodb.com", "https://www.elastic.co", "https://www.hashicorp.com",
  "https://www.pagerduty.com", "https://www.slack.com", "https://www.zoom.us"
];

// -------------------------------------------------------------
// ✉️ الرسالة التسويقية الموحدة
// -------------------------------------------------------------
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

// إرسال البيانات للشركة الحقيقية مع التأكد التام من عدم تكرارها
async function sendPayloadToRealTarget(targetUrl) {
  if (sentRegistry.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  try {
    const contactUrl = targetUrl.endsWith('/contact') ? targetUrl : `${targetUrl}/contact`;
    
    axios.post(contactUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, { timeout: 1200 }).catch(() => {});

    console.log(`[🚀 LIVE REAL COMPANY SENT] -> ${targetUrl} | Unique Sent: ${sentRegistry.size}`);
  } catch (err) {}
}

// -------------------------------------------------------------
// ⚡ محرك العمليات الفائق (بحث + إرسال متوازي + منع التكرار)
// -------------------------------------------------------------
async function hyperSpeedLiveWorker() {
  while (true) {
    try {
      // لو الطابور الحي قل، نقوم بعمل بحث فوري في الخلفية لجلب شركات جديدة
      if (liveDiscoveredQueue.length < 5) {
        await scrapeRealCompaniesFromWeb();
        if (liveDiscoveredQueue.length === 0) {
          // إذا تأخر البحث، نأخذ من القائمة الحقيقية الاحتياطية الضخمة
          liveDiscoveredQueue.push(...INITIAL_REAL_POOL);
        }
      }

      // سحب دفعة متوازية (Parallel Batch) لسرعة صاروخية تصل لـ 3000 رسالة/ساعة
      const batchSize = 5;
      const currentBatch = liveDiscoveredQueue.splice(0, batchSize);

      await Promise.all(currentBatch.map(async (target) => {
        if (!sentRegistry.has(target)) {
          await sendPayloadToRealTarget(target);
        }
      }));

      // فاصل زمني دقيق للحفاظ على السرعة المستهدفة بدون حظر السيرفرات
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} Live Search Engine Active 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueCompaniesContacted: sentRegistry.size,
    liveQueueRemaining: liveDiscoveredQueue.length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 LIVE SEARCH & REAL COMPANIES ENGINE ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`[🛡️ ANTI-DUPLICATION & AUTO-SCRAPING]: Active`);
  console.log(`======================================================\n`);

  // تشغيل عدة عمال متوازيين لضمان الإنتاجية القصوى
  for (let i = 0; i < 2; i++) {
    hyperSpeedLiveWorker();
  }
});

module.exports = app;
