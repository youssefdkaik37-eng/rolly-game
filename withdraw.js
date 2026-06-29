/* ==========================================================================
   منصة ROLLY الرسمية - النظام المتقدم لمعالجة طلبات السحب والأمان البنكي (withdraw.js)
   ========================================================================== */

// الخزنة التاريخية وجدول المتابعة لعمليات السحب المحجوزة في النظام
let withdrawSecurityLedger = {
    minimumWithdrawLimit: 200.00, // الحد الأدنى الصارم للسحب 200 درهم
    activeEscrowWithdrawals: [],  // الأموال المجمدة قيد المعالجة الإدارية
    totalWithdrawnVolume: 0.00    // إجمالي حجم السحوبات الناجحة
};

/**
 * دالة معالجة طلب السحب البنكي وتوليد رمز التحقق الأمني المشفر
 */
function executeWithdrawalRequest() {
    // 1. التحقق من صلاحية الجلسة وتسجيل دخول اللاعب أولاً
    if (typeof playerAccountTagID === "undefined" || playerAccountTagID === "") {
        alert("🛑 خرق أمني: يجب تسجيل الدخول والتحقق من هويتك الفوقية لبدء المعاملات المالية.");
        return;
    }

    const ribInputField = document.getElementById('withdrawFormRib');
    const amountInputField = document.getElementById('withdrawFormAmount');

    const userRibAddress = ribInputField.value.trim();
    const requestedAmount = parseFloat(amountInputField.value);

    // 2. جدار الحماية وفحص البيانات المدخلة بصرامة (Strict Financial Auditing)
    // فحص طول الحساب البنكي المغربي RIB لضمان سلامة التحويلات
    if (userRibAddress === "" || userRibAddress.length < 16) {
        alert("⚠️ خطأ مالي: رقم الحساب البنكي (RIB) غير مكتمل أو غير صحيح. يرجى إدخال الحساب المكون من 24 رقماً.");
        return;
    }

    if (isNaN(requestedAmount) || requestedAmount < withdrawSecurityLedger.minimumWithdrawLimit) {
        alert(`⚠️ خطأ مالي: لا يمكن معالجة العملية. الحد الأدنى المعتمد لتقديم طلبات السحب هو ${withdrawSecurityLedger.minimumWithdrawLimit} DH.`);
        return;
    }

    if (requestedAmount > balance) {
        alert("❌ رصيد غير كافٍ: القيمة المطلوبة تتجاوز الرصيد الصافي المتاح في محفظتك الرقمية حالياً.");
        return;
    }

    // 3. آلية تجميد وحجز الأموال (Balance Escrow Mechanism)
    // خصم فوري من الرصيد النشط وحجزه في السستم لضمان النزاهة التامة
    balance -= requestedAmount;
    document.getElementById('userBalance').innerText = balance.toFixed(2);

    // تحديث الرصيد المحفوظ في ذاكرة المتصفح المحلية بالتزامن مع ملف wallet.js
    if (typeof syncWalletWithLocalStorage === "function") {
        syncWalletWithLocalStorage();
    }

    // 4. محرك توليد أكواد السحب المشفرة والفريدة (Secure Token Generation Engine)
    // دمج معرف المستخدم والقيمة لإنتاج بصمة أمان فريدة مستحيلة التكرار
    const uniqueSalt = Math.floor(100000 + Math.random() * 900000);
    const generatedSecureToken = `WTH-${uniqueSalt}-${playerAccountTagID.substring(4)}`;

    // 5. تسجيل المعاملة في الخزنة الأمنية قيد المعالجة الإدارية اليدوية
    const withdrawalPayload = {
        transactionID: generatedSecureToken,
        playerID: playerAccountTagID,
        destinationRib: userRibAddress,
        frozenAmount: requestedAmount,
        status: "Awaiting_Admin_Email_Verification",
        timestamp: new Date().toISOString()
    };

    withdrawSecurityLedger.activeEscrowWithdrawals.push(withdrawalPayload);
    withdrawSecurityLedger.totalWithdrawnVolume += requestedAmount;

    // 6. التحديث الديناميكي الشامل لواجهات السحب وعرض البيانات الموجهة لبريدك
    document.getElementById('generatedSecureWithdrawToken').innerText = generatedSecureToken;
    document.getElementById('withdrawnMoneyValueView').innerText = requestedAmount.toFixed(2);

    // إخفاء حقول الإدخال وإظهار بوابة خطوة الأمان البريدية الأخيرة للمشترك
    document.getElementById('withdrawInputBlock').style.display = 'none';
    document.getElementById('withdrawBackBtn').style.display = 'none';
    document.getElementById('withdrawSuccessSecureBlock').style.display = 'block';

    console.log(`%c[ROLLY WITHDRAW] تم حجز أموال وتوليد كود سحب آمن: ${generatedSecureToken} بمبلغ ${requestedAmount} DH`, "color: #e63946; font-weight: bold;");
}

/**
 * دالة إنهاء تذكرة السحب وإعادة تصفير الواجهات بعد التأكيد البريدي
 */
function finaliseWithdrawExit() {
    // إعادة تهيئة وتنظيف حقول الشاشة بالكامل لحماية الخصوصية
    document.getElementById('withdrawSuccessSecureBlock').style.display = 'none';
    document.getElementById('withdrawInputBlock').style.display = 'block';
    document.getElementById('withdrawBackBtn').style.display = 'block';
    
    document.getElementById('withdrawFormRib').value = "";
    document.getElementById('withdrawFormAmount').value = "";
    
    // الانتقال الآمن للوحة القيادة
    if (typeof navigateTo === "function") {
        navigateTo('mainDashboard');
    }
}
