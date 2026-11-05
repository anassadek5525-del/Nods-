const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "Rocket-Beast-Engine";
const TELEGRAM_LINK = "https://t.me/AI_GrowthAgent_bot";
const PLATFORM_URL = "https://b2b-saas-platform-8955.bolt.host";
const MY_WALLET = "0x9426A467E0fFF34981656bd98580f60CFE395364";

const sentRegistry = new Set();
let liveQueue = [];

// -------------------------------------------------------------
// 🌐 أكثر من 30 قاعدة بيانات وكلمة مفتاحية للبحث الحي الصاروخي
// -------------------------------------------------------------
const MASSIVE_SEARCH_VECTORS = [
  "top b2b saas companies contact us", "global software engineering platform contact",
  "cloud infrastructure providers official site", "fintech startup solution contact",
  "enterprise marketing software partners", "ai automation tech company contact",
  "ecommerce solutions provider support", "cybersecurity platform enterprise sales",
  "crm software provider contact us", "devops tools company official page",
  "data analytics platform contact", "payment gateway provider support page",
  "hr software solutions contact", "erp software provider official site",
  "logistics tech platform contact", "edtech startup enterprise contact",
  "healthcare software provider site", "real estate tech platform contact",
  "legal tech software provider", "blockchain development company contact",
  "iot solutions provider official", "biotech startup platform contact",
  "telecom software solutions", "media streaming tech platform",
  "gaming tech infrastructure provider", "renewable energy tech company",
  "manufacturing software solutions", "retail tech platform contact us",
  "hospitality software provider", "travel tech startup contact"
];

// قاعدة ضخمة أولية لضمان الانطلاق الفوري
const INITIAL_MEGAPOOL = [
  "shopify.com", "stripe.com", "mailchimp.com", "hubspot.com", "zendesk.com", 
  "notion.so", "canva.com", "digitalocean.com", "heroku.com", "wix.com", 
  "squarespace.com", "salesforce.com", "adobe.com", "atlassian.com", "tableau.com", 
  "monday.com", "airtable.com", "clickup.com", "pipedrive.com", "revolut.com", 
  "wise.com", "checkout.com", "databricks.com", "snowflake.com", "mongodb.com", 
  "elastic.co", "hashicorp.com", "pagerduty.com", "slack.com", "zoom.us",
  "github.com", "gitlab.com", "twilio.com", "sendgrid.com", "cloudflare.com",
  "openai.com", "anthropic.com", "vercel.com", "netlify.com", "supabase.com"
];

function buildInitialQueue() {
  let q = [];
  INITIAL_MEGAPOOL.forEach(d => {
    const f = `https://www.${d}`;
    q.push(f, `${f}/contact`, `${f}/about`, `${f}/pricing`, `${f}/support`, `${f}/sales`, `${f}/enterprise`);
  });
  return q;
}

liveQueue = buildInitialQueue();

// -------------------------------------------------------------
// 🔎 محرك البحث الحي متعدد الدوال (Multi-Vector Web Scraper)
// -------------------------------------------------------------
async function fetchLiveCompaniesFromWeb() {
  const query = MASSIVE_SEARCH_VECTORS[Math.floor(Math.random() * MASSIVE_SEARCH_VECTORS.length)];
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
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
          
          if (!domain.includes('duckduckgo') && !domain.includes('wikipedia') && !domain.includes('youtube') && !sentRegistry.has(domain)) {
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

async function rocketSend(targetUrl) {
  if (sentRegistry.has(targetUrl)) return;
  sentRegistry.add(targetUrl);

  try {
    axios.post(targetUrl, {
      name: marketingData.senderName,
      email: 'support@enterprise-b2b.online',
      message: marketingData.messageBody
    }, { timeout: 500 }).catch(() => {});

    console.log(`[🚀 ROCKET BLAST SENT] -> ${targetUrl} | Total Unique Sent: ${sentRegistry.size}`);
  } catch (err) {}
}

// 🚀 عمال الصواريخ بلا توقف (Infinite Rocket Workers)
async function startRocketWorker() {
  while (true) {
    try {
      if (liveQueue.length < 10) {
        // جلب شركات جديدة فوراً من الويب عبر دوال البحث المتعددة
        await fetchLiveCompaniesFromWeb();
        if (liveQueue.length < 5) {
          liveQueue.push(...buildInitialQueue());
        }
      }

      if (sentRegistry.size > 15000) {
        sentRegistry.clear(); // تفريغ الذاكرة للحفاظ على السرعة القصوى للأبد
      }

      // سحب دفعة صاروخية وإرسالها بالتوازي التام
      const batch = liveQueue.splice(0, 20);
      await Promise.all(batch.map(target => rocketSend(target)));

    } catch (e) {
      // مواصلة الإرسال فوراً بدون أي توقف
    }
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} ROCKET BEAST ACTIVE 🚀`,
    platformUrl: PLATFORM_URL,
    totalUniqueSent: sentRegistry.size,
    liveQueueLeft: liveQueue.length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🔥 ROCKET BEAST ENGINE - 30+ SEARCH VECTORS ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`======================================================\n`);

  // تشغيل 4 عمال صواريخ للعمل بأقصى طاقة ممكنة في الخلفية
  for (let i = 1; i <= 4; i++) {
    startRocketWorker();
  }
});

module.exports = app;
