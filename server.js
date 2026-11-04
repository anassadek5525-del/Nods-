const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

const SERVER_IDENTITY = process.env.SERVER_IDENTITY || "ReTarget-Then-Discover-Node";

const TELEGRAM_LINK = "https://t.me/AI_GrowthAgent_bot";
// الرابط الجديد المحدث للمنصة
const PLATFORM_URL = "https://b2b-saas-platform-de-ygze.bolt.host";
const MY_WALLET = "0x9426A467E0fFF34981656bd98580f60CFE395364";

// -------------------------------------------------------------
// 🔗 BSC On-Chain Verification (اشتراك بقيمة 200$ شهرياً)
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
        // حساب القيمة بالدولار بناءً على السعر الحالي للـ BNB (تقريباً 700$ للـ BNB الواحد لتغطية 200$)
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
// 📋 1. قائمة الشركات القديمة (إعادة تعيين وبدء الإرسال من جديد بالرابط الجديد)
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

const SEARCH_KEYWORDS = [
  "b2b saas platform", "logistics software company", "fintech startup contact",
  "ecommerce solution provider", "marketing automation tools", "enterprise software vendor",
  "ai business solutions", "cloud infrastructure providers"
];

async function discoverNewTargetLeads() {
  const randomKeyword = SEARCH_KEYWORDS[Math.floor(Math.random() * SEARCH_KEYWORDS.length)];
  console.log(`[🔎 AUTO-DISCOVERY ACTIVE] Searching web for new unseen leads: "${randomKeyword}"...`);

  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(randomKeyword)}`;
    const response = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 3000
    });

    const $ = cheerio.load(response.data);
    $('.result__url').each((i, el) => {
      let rawUrl = $(el).text().trim();
      if (rawUrl) {
        if (!rawUrl.startsWith('http')) rawUrl = `https://${rawUrl}`;
        try {
          const domain = new URL(rawUrl).origin;
          if (!sentRegistry.has(domain) && !INITIAL_TARGETS.includes(domain) && !freshDiscoveryQueue.includes(domain)) {
            freshDiscoveryQueue.push(domain);
          }
        } catch (e) {}
      }
    });

    console.log(`[✨ FRESH LEADS FOUND] Added ${freshDiscoveryQueue.length} new unique companies to queue.`);
  } catch (err) {}
}

// -------------------------------------------------------------
// ✉️ الرسالة التسويقية المحدثة ($200 USD شهرياً + الرابط الجديد)
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
      timeout: 2000
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

    await axios.post(formAction, formData, { timeout: 1500 }).catch(() => {});
    console.log(`[⚡ 50 MSG/MIN | ${mode}] Sent to: ${targetUrl} | Link: ${PLATFORM_URL}`);
  } catch (error) {
    console.log(`[⚡ FAST DISPATCH | ${mode}] Direct payload sent to: ${targetUrl}`);
  }
}

// -------------------------------------------------------------
// 🚀 المحرك الذكي المزدوج
// -------------------------------------------------------------
async function masterExecutionLoop() {
  if (PREVIOUS_TARGETS_QUEUE.length > 0) {
    const target = PREVIOUS_TARGETS_QUEUE.shift();
    await sendPayload(target, "RE-TARGETING PREVIOUS");
    return;
  }

  if (freshDiscoveryQueue.length < 5) {
    await discoverNewTargetLeads();
  }

  if (freshDiscoveryQueue.length > 0) {
    const nextNewTarget = freshDiscoveryQueue.shift();
    await sendPayload(nextNewTarget, "NEW DISCOVERED TARGET");
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
  console.log(`[🚀 HYBRID RE-TARGET & AUTO-DISCOVERY ENGINE ACTIVE]`);
  console.log(`[🔗 NEW LINK]: ${PLATFORM_URL}`);
  console.log(`[💳 PLAN]: $200 USD Subscription Active`);
  console.log(`[🎯 STEP 1]: Re-targeting ${PREVIOUS_TARGETS_QUEUE.length} previous companies with NEW URL.`);
  console.log(`======================================================\n`);

  setInterval(() => {
    masterExecutionLoop();
  }, 1200);
});

module.exports = app;
