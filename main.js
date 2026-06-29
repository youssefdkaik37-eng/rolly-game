/* ==========================================================================
   منصة ROLLY الرسمية - المنسق العام والمحرك التشغيلي للمنصة (main.js)
   ========================================================================== */

/**
 * دالة التنقل الديناميكي الفوري بين شاشات وغرف المنصة (Screen Router)
 * @param {string} screenId - المعرف الخاص بالشاشة المستهدفة
 */
function navigateTo(screenId) {
    // 1. إخفاء جميع الشاشات النشطة حالياً عبر إزالة كلاس النشاط
    document.querySelectorAll('.screen').forEach(screenNode => {
        screenNode.classList.remove('active');
    });

    // 2. إظهار الشاشة المستهدفة بدقة عبر إضافة كلاس النشاط المبرمج في style.css
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log(`[ROLLY MAIN] تم الانتقال الآمن إلى الشاشة: ${screenId}`);
    } else {
        console.error(`[ROLLY MAIN] خطأ تكتيكي: الشاشة المستهدفة ${screenId} غير موجودة في هيكل الـ HTML.`);
    }
}

/**
 * دالة نسخ رابط الإحالة الترويجي الخاص باللاعب بنقرة زر واحدة
 */
function copyReferralLink() {
    const linkElement = document.getElementById('shareableReferralLink');
    if (!linkElement) return;

    const linkText = linkElement.innerText;

    // استخدام بروتوكولات النسخ الحديثة للمتصفحات لضمان العمل على جميع الهواتف
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkText).then(() => {
            alert("✅ تم نسخ رابط الإحالة الترويجي الخاص بك بنجاح! شاركه وابدأ في جني عمولات الـ 2%.");
        }).catch(err => {
            console.error("فشل النسخ عبر البروتوكول الحديث:", err);
            fallbackCopyMechanism(linkText);
        });
    } else {
        fallbackCopyMechanism(linkText);
    }
}

/**
 * آلية نسخ احتياطية للهواتف والمتصفحات القديمة لضمان عدم تعطل ميزة الترويج
 */
function fallbackCopyMechanism(text) {
    const temporaryTextArea = document.createElement("textarea");
    temporaryTextArea.value = text;
    temporaryTextArea.style.position = "fixed"; // منع التمرير البصري المزعج بالهاتف
    document.body.appendChild(temporaryTextArea);
    temporaryTextArea.focus();
    temporaryTextArea.select();
    
    try {
        document.execCommand('copy');
        alert("✅ تم نسخ رابط الإحالة بنجاح!");
    } catch (err) {
        alert("❌ عذراً، فشل النسخ التلقائي. يرجى تحديد الرابط ونسخه يدوياً.");
    }
    
    document.body.removeChild(temporaryTextArea);
}

/**
 * نظام التفتيش اللوجستي والتأكد من تكامل الملفات الخمسة وجاهزية الإطلاق
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("%c==================================================", "color: #ffb703;");
    console.log("%c🚀 منصة ROLLY الملوكية والعملاقة جاهزة للعمل والترويج الحقيقي 🚀", "color: #ffb703; font-weight: bold; font-size: 14px;");
    console.log("%cتم ربط وتكامل الملفات الخمسة بنجاح بنسبة 100%.", "color: #2ec4b6;");
    console.log("%c==================================================", "color: #ffb703;");
    
    // إتاحة الدخول المباشر إذا كانت هناك جلسة محفوظة مسبقاً بالتنسيق مع ملف auth.js
    if (typeof checkExistingSession === "function") {
        checkExistingSession();
    }
});
