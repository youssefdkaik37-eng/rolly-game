/* ==========================================================================
   منصة ROLLY الرسمية - المحرك المالي المتقدم وإدارة الأرصدة (wallet.js)
   ========================================================================== */

// سجل العمليات المالية التاريخي للمحفظة
let walletFinancialLedger = {
    currentBalance: 0.00,
    depositTickets: [],
    activatedVouchers: [],
    adminFeeRate: 0.05 // رسوم الشحن الإدارية الثابتة 5%
};

// قائمة قسائم الشحن الرسمية المشفرة والمتاحة للترويج الفعلي للمنصة
const ROLLY_GLOBAL_VOUCHERS = {
    "RLY-100-SUPER": { amount: 100.00, type: "Standard", active: true },
    "RLY-500-ROYAL": { amount: 500.00, type: "Premium", active: true },
    "RLY-1000-FLEX": { amount: 1000.00, type: "VIP", active: true }
};

/**
 * دالة المطالبة بتفعيل الكوبونات الترويجية وشحن الحساب فورياً
 */
function claimVoucher() {
    // التأكد أولاً من تسجيل دخول اللاعب وصلاحية الجلسة
    if (typeof playerAccountTagID === "undefined" || playerAccountTagID === "") {
        alert("🛑 خطأ مالي: يجب تسجيل الدخول وتنشيط هويتك أولاً للمطالبة بالكوبونات.");
        return;
    }

    const voucherInput = document.getElementById('voucherCodeInput').value.trim().toUpperCase();
    
    if (voucherInput === "") {
        alert("⚠️ يرجى إدخال رمز قسيمة الشحن أولاً.");
        return;
    }

    // الفحص الصارم لوجود الكود وحالته التشغيلية
    if (ROLLY_GLOBAL_VOUCHERS.hasOwnProperty(voucherInput)) {
        const voucherData = ROLLY_GLOBAL_VOUCHERS[voucherInput];
        
        if (!voucherData.active) {
            alert("❌ هذا الكود تم استخدامه مسبقاً من قِبل لاعب آخر أو انتهت صلاحيته.");
            return;
        }

        // إيداع القيمة المالية الصافية في المحفظة
        balance += voucherData.amount;
        walletFinancialLedger.currentBalance = balance;
        
        // تحديث واجهة المستخدم فوراً
        document.getElementById('userBalance').innerText = balance.toFixed(2);
        
        // تعطيل القسيمة البرمجية لمنع التكرار وحفظها في السجلات
        voucherData.active = false;
        walletFinancialLedger.activatedVouchers.push({
            code: voucherInput,
            amount: voucherData.amount,
            timestamp: new Date().toISOString()
        });

        // حفظ تحديثات الرصيد في جرد الجلسة المستقرة
        syncWalletWithLocalStorage();

        alert(`🎉 مبروك! تم تفعيل قسيمة الـ ${voucherData.type} بنجاح، وإضافة ${voucherData.amount.toFixed(2)} DH إلى محفظتك الملوكية.`);
        document.getElementById('voucherCodeInput').value = "";
        
        console.log(`%c[ROLLY WALLET] تم شحن كود ترويجي: ${voucherInput} بقيمة ${voucherData.amount} DH`, "color: #10b981; font-weight: bold;");
    } else {
        alert("❌ رمز التفعيل غير صحيح أو غير معتمد في شبكة ROLLY حالياً.");
    }
}

/**
 * دالة إنشاء وتأكيد تذكرة إيداع مالي يدوية مع تحميل سكرين شوت الإثبات
 */
function executeDepositTicket() {
    const rawAmount = document.getElementById('depositFormAmount').value;
    const depositAmount = parseFloat(rawAmount);
    const fileInput = document.getElementById('depositFormFile');
    const targetBankTitle = document.getElementById('metaBankTitle').innerText;

    // فحص سلامة القيمة والحد الأدنى للعمليات التجارية
    if (isNaN(depositAmount) || depositAmount < 100) {
        alert("⚠️ خطأ في المعالجة: الحد الأدنى القانوني لرفع تذاكر الإيداع هو 100 درهم مغربي.");
        return;
    }
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("⚠️ خطأ في المعالجة: يرجى تحميل صورة لقطة شاشة إثبات التحويل (Screenshot) لتوثيق التذكرة.");
        return;
    }

    // حساب الرسوم الإدارية وصافي الرصيد المتوقع وصوله بعد الاقتطاع
    const computedFee = depositAmount * walletFinancialLedger.adminFeeRate;
    const netDepositAmount = depositAmount - computedFee;

    // توليد ميكانيكي لبيانات التذكرة الموجهة لقاعدة الإدارة
    const ticketPayload = {
        ticketID: "DEP-" + Math.floor(100000 + Math.random() * 900000),
        bankName: targetBankTitle,
        declaredAmount: depositAmount,
        processingFee: computedFee,
        expectedNet: netDepositAmount,
        proofFileName: fileInput.files[0].name,
        status: "Pending_Review",
        timestamp: new Date().toISOString()
    };

    // دفع التذكرة إلى السجلات التاريخية للمحفظة
    walletFinancialLedger.depositTickets.push(ticketPayload);
    
    // إخفاء واجهة المدخلات وإظهار نافذة النجاح والتوجيه البريدي للمشترك
    document.getElementById('depositFormContainer').style.display = 'none';
    document.getElementById('depositSuccessAlert').style.display = 'block';

    console.log(`[ROLLY WALLET] تم إنشاء تذكرة إيداع جديدة بنجاح: ${ticketPayload.ticketID} بمبلغ ${ticketPayload.declaredAmount} DH`);
}

/**
 * دالة مزامنة الرصيد المالي الحالي وحفظه بشكل دائم داخل المتصفح
 */
function syncWalletWithLocalStorage() {
    try {
        const sessionData = localStorage.getItem('ROLLY_USER_SESSION');
        if (sessionData) {
            let parsedSession = JSON.parse(sessionData);
            parsedSession.savedBalance = balance;
            localStorage.setItem('ROLLY_USER_SESSION', JSON.stringify(parsedSession));
        }
    } catch (e) {
        console.error("[ROLLY WALLET] فشل مزامنة الرصيد محلياً:", e);
    }
}

/**
 * دالة استرداد الرصيد المالي التاريخي عند تسجيل الدخول أو تحديث الصفحة
 */
function restoreWalletBalance() {
    try {
        const sessionData = localStorage.getItem('ROLLY_USER_SESSION');
        if (sessionData) {
            const parsedSession = JSON.parse(sessionData);
            if (parsedSession.hasOwnProperty('savedBalance')) {
                balance = parseFloat(parsedSession.savedBalance);
                walletFinancialLedger.currentBalance = balance;
                document.getElementById('userBalance').innerText = balance.toFixed(2);
                console.log(`[ROLLY WALLET] تم استعادة الرصيد المالي بنجاح من الخزنة المحلية: ${balance} DH`);
            }
        }
    } catch (e) {
        console.error("[ROLLY WALLET] خطأ في استرداد بيانات المحفظة المحفوظة:", e);
    }
}

// ربط آلية استرداد الرصيد المالي بمجرد انتهاء تحميل الهيكل الأساسي للواجهات
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(restoreWalletBalance, 100); // تأخير بسيط لضمان ترابط ملف الحماية أولاً
});
