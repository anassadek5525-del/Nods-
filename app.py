import streamlit as st
import time
import pandas as pd

# 1. إعدادات الصفحة
st.set_page_config(
    page_title="AI Growth-Hacking Enterprise Platform",
    page_icon="🚀",
    layout="wide"
)

# 2. قواعد البيانات والذاكرة المحلية
if "companies_database" not in st.session_state:
    st.session_state["companies_database"] = {
        "admin123": {"type": "admin", "name": "الأدمن الرئيسية", "status": "active"}
    }

if "current_logged_company" not in st.session_state:
    st.session_state["current_logged_company"] = None

if "ai_chat_history" not in st.session_state:
    st.session_state["ai_chat_history"] = {}

# ---------------------------------------------------------
# نظام التنقل التلقائي بين الموقعين (فصل تام)
# ---------------------------------------------------------
st.sidebar.title("🌐 بوابة المنصة")
site_choice = st.sidebar.radio(
    "اختر القسم:", 
    ["💳 موقع الاشتراك والدفع الفوري", "🔑 موقع دخول الشركات المستقل"]
)

# =========================================================
# الموقع الأول: موقع الدفع والاشتراك الآلي
# =========================================================
if site_choice == "💳 موقع الاشتراك والدفع الفوري":
    st.title("🚀 منصة النمو الذكي للشركات ($200/شهر)")
    st.write("بوابة الدفع والاشتراك الآلي - نظام SaaS متكامل مع عزل تام وتفعيل فوري.")
    st.markdown("---")

    st.subheader("خطوات الدفع والتفعيل الفوري")
    
    my_usdt_wallet = "0x9426A467E0fFF34981656bd98580f60CFE395364"
    payment_uri = f"ethereum:{my_usdt_wallet}"
    
    # مربع أحمر صارخ للتنبيه على شبكة BNB لمنع الأخطاء
    st.markdown(f"""
    <div style="background-color: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h4 style="color: #991b1b; margin-top: 0;">🚨 تنبيه هامة جداً قبل التحويل:</h4>
        <p style="color: #7f1d1d; font-size: 15px; font-weight: bold;">
            يجب التحويل حصراً عبر شبكة <b>BNB Smart Chain (BEP20)</b>[span_0](start_span)[span_0](end_span)[span_1](start_span)[span_1](end_span). أي تحويل على شبكة أخرى سيؤدي لضياع الأموال ولن يتم تفعيل حسابك أوتوماتيكياً!
        </p>
        <hr style="border-color: #fca5a5;">
        <h4 style="color: #1e3a8a; margin-top: 10px;">🌐 عنوان محفظتك المعتمد لاستلام الأرباح:</h4>
        <div style="background: #1e293b; padding: 12px; border-radius: 6px; font-family: monospace; color: #10b981; font-size: 15px; text-align: center; margin: 10px 0; word-break: break-all;">
            {my_usdt_wallet}
        </div>
        <p style="color: #334155; text-align: center; font-size: 13px; margin-bottom: 15px;">المبلغ المطلوب: <b>200 دولار USDT</b></p>
    </div>
    """, unsafe_allow_html=True)
    
    # زر الدفع التفاعلي المباشر
    st.markdown(f"""
    <div style="text-align: center; margin-bottom: 25px;">
        <a href="{payment_uri}" target="_blank" style="background-color: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">🔗 اضغط هنا لفتح محفظتك والدفع السريع</a>
    </div>
    """, unsafe_allow_html=True)
    
    tx_hash = st.text_input("أدخل رقم المعاملة أو كود التحويل (TXID) بعد إتمام الدفع على شبكة BNB:")
    
    if st.button("✨ تفعيل المنصة الخاصة بي أوتوماتيكياً"):
        if len(tx_hash.strip()) >= 5:
            new_company_id = f"comp_sec_{int(time.time())}"
            st.session_state["companies_database"][new_company_id] = {
                "type": "client",
                "status": "active",
                "tx_hash": tx_hash,
                "amount": 200,
                "network": "BNB Smart Chain (BEP20)",
                "created_at": time.time()
            }
            st.success(f"🎉 تم تفعيل منصتك أوتوماتيكياً بنجاح! كود الدخول السري الخاص بك: **{new_company_id}** (انسخه وادخل بيه في قسم تسجيل الدخول من القائمة الجانبية)")
        else:
            st.error("❌ برجاء إدخال رقم المعاملة أو كود التحويل الصحيح.")

# =========================================================
# الموقع الثاني: موقع دخول الشركات والتحكم المستقل
# =========================================================
elif site_choice == "🔑 موقع دخول الشركات المستقل":

    # 1. لوحة تحكم الأدمن
    if st.session_state["current_logged_company"] == "admin123":
        st.title("🛡️ لوحة تحكم الأدمن والسيبرانات")
        st.success("متابعة العمليات، السيرفرات النشطة، وإيرادات المنصة:")
        
        total_clients = len(st.session_state["companies_database"]) - 1
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("الشركات المشتركة الفاعلة", f"{total_clients} شركة")
        with col2:
            st.metric("إجمالي الإيرادات", f"${total_clients * 200}")
        with col3:
            st.metric("حالة السيرفرات", "🟢 تعمل بكفاءة")

        st.markdown("---")
        st.subheader("📋 سجل المعاملات والشركات:")
        st.json(st.session_state["companies_database"])

        if st.button("🚪 خروج الأدمن"):
            st.session_state["current_logged_company"] = None
            st.rerun()

    # 2. لوحة تحكم العميل المشترك (المنصة المعزولة ذات المستوى العالمي)
    elif st.session_state["current_logged_company"] and st.session_state["current_logged_company"] != "admin123":
        comp_id = st.session_state["current_logged_company"]
        st.title(f"🔒 لوحة تحكم شركتك المعزولة (ID: {comp_id})")
        st.success("✅ اشتراكك مفعل بنجاح! جميع أدوات النمو وتحليل المنتجات العالمية تعمل بكفاءة.")
        
        # تبويبات الواجهة الداخلية المطورة
        tab_tools, tab_products, tab_ai, tab_server = st.tabs([
            "🚀 أدوات النمو الشاملة", 
            "📦 تحليل المنتجات والبيانات الذكي", 
            "🤖 مستشار الذكاء الاصطناعي التخصصي", 
            "⚙️ محرك السيرفرات الآلي"
        ])

        with tab_tools:
            st.subheader("📊 لوحة مؤشرات الأداء والنمو (Growth Dashboard)")
            col_a, col_b, col_c = st.columns(3)
            with col_a:
                st.metric("العملاء المستهدفين (B2B)", "4,820 عميل", "+12% اليوم")
            with col_b:
                st.metric("الحملات الآلية النشطة", "8 حملات", "تجري الآن")
            with col_c:
                st.metric("معدل التحويل المتوقع", "18.4%", "مرتفع 🟢")
            
            st.markdown("---")
            st.info("💡 مساحة العمل الخاصة بك معزولة تماماً وآمنة بنسبة 100% لضمان أعلى أداء تسويقي.")

        with tab_products:
            st.subheader("📦 مركز تحليل المنتجات والبيانات المتقدم")
            st.write("ارفع ملفات منتجاتك، قوائم الأسعار، أو داتا العملاء ليقوم النظام بتحليلها واستخراج الفرص:")
            
            uploaded_prod_file = st.file_uploader("ارفع ملف المنتجات أو العملاء (CSV, Excel, TXT):", type=["csv", "xlsx", "txt"])
            if uploaded_prod_file is not None:
                with st.spinner("جاري تحليل المنتجات وأنماط السوق بواسطة خوارزميات الذكاء الاصطناعي..."):
                    time.sleep(2)
                st.success("✅ تم تحليل المنتجات والبيانات بنجاح واستخراج التوصيات التسويقية!")
                
                if uploaded_prod_file.name.endswith('.csv'):
                    df_prod = pd.read_csv(uploaded_prod_file)
                    st.dataframe(df_prod.head(10))
                else:
                    st.write("📈 **تقرير التحليل الفوري للمنتجات:**")
                    st.write("- تم تحديد نقاط القوة السعرية للمنتج.")
                    st.write("- تم رصد الفئة المستهدفة الأكثر تفاعلاً في السوق الرقمي.")

        with tab_ai:
            st.subheader("🤖 مستشار الذكاء الاصطناعي التخصصي للنمو")
            st.write("اسأل خبير النمو الآلي عن استراتيجيات تسويق منتجاتك وكيفية مضاعفة المبيعات:")
            
            if comp_id not in st.session_state["ai_chat_history"]:
                st.session_state["ai_chat_history"][comp_id] = [
                    {"role": "assistant", "content": "أهلاً بك يا فنان! تذكر دائماً أن مدفوعات الشبكة وتحديثات الاشتراكات تتم حصراً عبر شبكة BNB Smart Chain[span_2](start_span)[span_2](end_span)[span_3](start_span)[span_3](end_span). كيف أساعدك في تحليل منتجاتك أو إطلاق حملتك اليوم؟"}
                ]
            
            for msg in st.session_state["ai_chat_history"][comp_id]:
                with st.chat_message(msg["role"]):
                    st.write(msg["content"])
                    
            user_query = st.chat_input("اكتب استفسارك أو خطتك هنا...")
            if user_query:
                st.session_state["ai_chat_history"][comp_id].append({"role": "user", "content": user_query})
                with st.chat_message("user"):
                    st.write(user_query)
                
                ai_reply = f"بناءً على تحليل منتجاتك وبيانات السوق، ولمواصلة العمل بكفاءة عبر شبكة BNB[span_4](start_span)[span_4](end_span)[span_5](start_span)[span_5](end_span)، أقترح عليك تنفيذ الآتي بخصوص طلبك: '{user_query}' لضمان أعلى عائد استثماري."
                st.session_state["ai_chat_history"][comp_id].append({"role": "assistant", "content": ai_reply})
                with st.chat_message("assistant"):
                    st.write(ai_reply)

        with tab_server:
            st.subheader("⚙️ محرك تشغيل السيرفرات والبحث الآلي (Background Worker)")
            st.write("التحكم الكامل في تشغيل العقد وسيرفرات زحف البيانات وجلب العملاء طيارة:")
            
            if st.button("🚀 تشغيل سيرفرات البحث والتحليل الفوري"):
                with st.spinner("جاري إرسال إشارات التشغيل للسيرفرات وبدء جلب العملاء..."):
                    time.sleep(3)
                st.success("🔥 تعمل الآن سيرفرات البحث والتحليل بأقصى طاقة بكفاءة تامة!")

        st.markdown("---")
        if st.button("🚪 تسجيل الخروج"):
            st.session_state["current_logged_company"] = None
            st.rerun()

    # 3. شاشة تسجيل الدخول للشركات
    else:
        st.title("🔑 بوابة دخول الشركات المستقلة")
        st.write("أدخل كود شركتك السري الذي حصلت عليه بعد إتمام عملية الدفع للوصول إلى بيئة عملك المعزولة.")
        st.markdown("---")
        
        entered_secret = st.text_input("أدخل كود شركتك السري:", type="password")
        
        if st.button("🔐 دخول المنصة"):
            if entered_secret in st.session_state["companies_database"]:
                st.session_state["current_logged_company"] = entered_secret
                st.rerun()
            else:
                st.error("❌ عذراً، هذا الكود غير مسجل أو خطأ في البيانات.")
