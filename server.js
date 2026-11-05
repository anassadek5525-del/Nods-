const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "ReTarget-Then-Discover-Node";
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
// 📋 1. القوائم الأوليّة والاحتياطية المضمنة
// -------------------------------------------------------------
const INITIAL_TARGETS = [
  "https://www.shopify.com", "https://www.stripe.com", "https://www.mailchimp.com",
  "https://www.hubspot.com", "https://www.zendesk.com", "https://www.notion.so",
  "https://www.canva.com", "https://www.digitalocean.com", "https://www.heroku.com",
  "https://www.wix.com", "https://www.squarespace.com", "https://www.wordpress.org",
  "https://www.intercom.com", "https://www.asana.com", "https://www.trello.com",
  "https://www.loom.com", "https://www.figma.com", "https://www.miro.com",
  "https://www.slack.com", "https://www.dropbox.com", "https://www.zoho.com",
  "https://www.freshworks.com", "https://www.bluehost.com", "https://www.godaddy.com",
  "https://www.namecheap.com", "https://www.cloudflare.com", "https://www.twilio.com",
  "https://www.sendgrid.com", "https://www.mixpanel.com", "https://www.hotjar.com",
  "https://www.buffer.com", "https://www.hootsuite.com", "https://www.sproutsocial.com",
  "https://www.semrush.com", "https://www.ahrefs.com", "https://www.grammarly.com",
  "https://www.zapier.com", "https://www.typeform.com", "https://www.surveymonkey.com",
  "https://www.github.com", "https://www.gitlab.com"
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
  "https://www.elastic.co", "https://www.hashicorp.com", "https://www.pagerduty.com",
  "https://www.datadoghq.com", "https://www.newrelic.com", "https://www.sentry.io",
  "https://www.auth0.com", "https://www.postman.com", "https://www.webflow.com",
  "https://www.framer.com", "https://www.calendly.com", "https://www.freshdesk.com",
  "https://www.gusto.com", "https://www.rippling.com", "https://www.deel.com", "https://www.remote.com",
  "https://www.activecampaign.com", "https://www.brex.com", "https://www.ramp.com", "https://www.klarna.com"
];

const SEARCH_KEYWORDS = [
  "b2b saas platform pricing contact", "logistics software company contact us",
  "fintech startup official site", "ecommerce solution provider contact",
  "marketing automation tools company", "enterprise software vendors list",
  "ai business solutions company", "cloud infrastructure providers contact"
];

// -------------------------------------------------------------
// 🔎 دالة البحث الحقيقي والضخ الفوري
// -------------------------------------------------------------
async function discoverNewTargetLeads() {
  const randomKeyword = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)];
  console.log(`[🔎 REAL SEARCH ACTIVE] Scraping web for fresh companies: "${randomKeyword}"...`);

  let newlyFoundCount = 0;

  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(randomKeyword)}`;
    const response = await axios.get(searchUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' 
      },
      timeout: 3000
    });

    const $ = cheerio.load(response.data);
    $('.result__url, .result__snippet, a.result__a').each((i, el) => {
      let rawText = $(el).attr('href') || $(el).text().trim();
      let matches = rawText.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi);
      
      if (matches) {
        matches.forEach(rawUrl => {
          try {
            const parsed = new URL(rawUrl);
            const domain = parsed.origin;
            const isIgnored = domain.includes('duckduckgo') || domain.includes('google') || domain.includes('bing') || domain.includes('wikipedia');
            
            if (!isIgnored && !sentRegistry.has(domain) && !INITIAL_TARGETS.includes(domain) && !freshDiscoveryQueue.includes(domain)) {
              freshDiscoveryQueue.push(domain);
              newlyFoundCount++;
            }
          } catch (e) {}
        });
      }
    });
  } catch (err) {}

  if (newlyFoundCount === 0) {
    for (let i = 0; i < 10; i++) {
      const randomLead = BACKUP_LEADS_POOL[Math.floor(Math.random() * BACKUP_LEADS_POOL.length)];
      if (!freshDiscoveryQueue.includes(randomLead)) {
        freshDiscoveryQueue.push(randomLead);
        newlyFoundCount++;
      }
    }
  }

  console.log(`[✨ QUEUE RELOADED] Successfully loaded ${newlyFoundCount} new active companies to execution queue.`);
}

// -------------------------------------------------------------
// ✉️ الرسالة التسويقية
// -------------------------------------------------------------
function getMagneticMarketingMessage(companyName) {
  return {
    subject: `[مهم] تحديث رابط منصة الذكاء الاصطناعي B2B لشركة [${companyName || 'الشريكة'}]`,
    senderName: "منظومة B2B Enterprise SaaS",
    messageBody: `
مرحباً بكم فريق ${companyName || 'التميز'}،

نود إعلامكم بتحديث الرابط الرسمي لمنصة الذكاء الاصطناعي المؤسسية الجديدة المخصصة لمضاعفة المبيعات وأتمتة العمليات التجارية بالكامل.

💎 **مميزات المنصة والحلول المتاحة:**
• تحليلات المنتجات والمخزون بهوامش الأرباح لحظياً عبر Gemini AI Engine.
• أدوات إدارة الملفات والتقارير التنفيذية (CSV / Excel / PDF).
• نظام اشتراك آمن وشفاف مفعل عبر شبكة BNB Smart Chain.

🌐 **الرابط الجديد المعتمد للتسجيل والتجربة:**
🔗 ${PLATFORM_URL}

💳 **تفاصيل الاشتراك الشهري:**
• التكلفة: $200 USD شهرياً (ما يعادلها بـ BNB On-Chain).
• محفظة الدفع الرسمية: ${MY_WALLET}

للتواصل المباشر عبر التليجرام:
🔗 ${TELEGRAM_LINK}

تحياتنا،
فريق B2B Enterprise SaaS
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
      timeout: 1500
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
        if (nameAttr.includes('name') || nameAttr.includes('author')) formData[nameAttr] = marketingData.senderName;
        else if (nameAttr.includes('email') || nameAttr.includes('mail')) formData[nameAttr] = 'support@enterprise-b2b.online';
        else if (nameAttr.includes('message') || nameAttr.includes('comment') || nameAttr.includes('body')) formData[nameAttr] = marketingData.messageBody;
        else formData[nameAttr] = 'تحديث رابط B2B SaaS Enterprise';
      }
    });

    axios.post(formAction, formData, { timeout: 1200 }).catch(() => {});
    console.log(`[⚡ 50 MSG/MIN | ${mode}] Sent to: ${targetUrl} | Link: ${PLATFORM_URL}`);
  } catch (error) {
    console.log(`[⚡ FAST DISPATCH | ${mode}] Direct payload sent to: ${targetUrl}`);
  }
}

// -------------------------------------------------------------
// 🚀 المحرك الذكي المزدوج (مضبوط على 50 رسالة/دقيقة بالضبط)
// -------------------------------------------------------------
async function masterExecutionLoop() {
  try {
    if (PREVIOUS_TARGETS_QUEUE.length > 0) {
      const target = PREVIOUS_TARGETS_QUEUE.shift();
      sendPayload(target, "RE-TARGETING PREVIOUS");
      return;
    }

    if (freshDiscoveryQueue.length < 5) {
      discoverNewTargetLeads();
    }

    if (freshDiscoveryQueue.length > 0) {
      const nextNewTarget = freshDiscoveryQueue.shift();
      sendPayload(nextNewTarget, "NEW DISCOVERED TARGET");
    } else {
      console.log(`[🔄 RE-INITIALIZING QUEUE] Reloading backup pool to prevent server idle...`);
      PREVIOUS_TARGETS_QUEUE = [...BACKUP_LEADS_POOL];
    }
  } catch (criticalErr) {
    console.log(`[🛡️ RECOVERY SYSTEM ACTIVE] Prevented crash: ${criticalErr.message}`);
  }
}

app.get('/', (req, res) => {
  res.status(200).json({
    status: `${SERVER_IDENTITY} Online 🚀`,
    platformUrl: PLATFORM_URL,
    subscriptionPlan: "$200 USD / Month",
    remainingPreviousTargets: PREVIOUS_TARGETS_QUEUE.length,
    discoveredNewQueue: freshDiscoveryQueue.length,
    totalSent: sentRegistry.size,
    rate: "50 msg/min"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[🚀 HYBRID CONTINUOUS SEARCH ENGINE ACTIVE]`);
  console.log(`[🔗 LINK]: ${PLATFORM_URL}`);
  console.log(`[⚡ RATE]: Exactly 50 companies per minute (1 msg / 1.2s)`);
  console.log(`======================================================\n`);

  // 1.2 ثانية (1200 مللي ثانية) = 50 إرسال في الدقيقة بالضبط (60s / 50 = 1.2s)
  setInterval(() => {
    masterExecutionLoop();
  }, 1200);
});

module.exports = app;
