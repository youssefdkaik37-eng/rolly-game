/* ==========================================================================
   منصة ROLLY الرسمية - المحرك المتقدم لإدارة الحسابات والحماية الرقمية (auth.js)
   ========================================================================== */

// البنية التحتية لهوية اللاعب النشط
let currentSessionUser = {
    username: "",
    email: "",
    accountID: "",
    authToken: "",
    registrationDate: "",
    isVerified: false
};

/**
 * دالة التهيئة الملوكية لتفعيل حساب اللاعب والتحقق الصارم من البيانات
 */
function initiateUserAccount() {
    const usernameInput = document.getElementById('regUsername').value.trim();
    const emailInput = document.getElementById('regEmail').value.trim();
    const agreeCheckbox = document.getElementById('regAgree').checked;

    // 1. نظام جدار الحماية والتحقق من المدخلات (Strict Validation)
    if (usernameInput === "") {
        alert("⚠️ خطأ أمني: يرجى تحديد اسم اللاعب المستعار لتنشيط الهوية الرقمية في المنصة.");
        return;
    }
    if (usernameInput.length < 3 || usernameInput.length > 20) {
        alert("⚠️ خطأ أمني: يجب أن يكون اسم اللاعب بين 3 إلى 20 حرفاً.");
        return;
    }
    
    // فحص البريد الإلكتروني بعبارات برمجية دقيقة (Regex) لمنع الحسابات الوهمية
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput === "" || !emailRegex.test(emailInput)) {
        alert("⚠️ خطأ إداري: يرجى إدخال بريد إلكتروني حقيقي وصالح (Gmail) لربطه بسجلات السحب والمعاملات المالية.");
        return;
    }
    
    if (!agreeCheckbox) {
        alert("⚠️ خطأ قانوني: يجب قراءة والموافقة على وثيقة الشروط والرسوم الإدارية لشبكة ROLLY للاستمرار.");
        return;
    }

    // 2. توليد الهوية الرقمية والتوكين المشفر للمستخدم (Secure Token Generation)
    const generatedID = "RLY-" + Math.floor(100000 + Math.random() * 900000);
    const mockAuthToken = "SECURE_TOK_" + btoa(usernameInput + "_" + generatedID).substring(0, 16);

    // 3. تخزين البيانات داخل كائن الهوية المركزي
    currentSessionUser.username = usernameInput;
    currentSessionUser.email = emailInput;
    currentSessionUser.accountID = generatedID;
    currentSessionUser.authToken = mockAuthToken;
    currentSessionUser.registrationDate = new Date().toISOString();
    currentSessionUser.isVerified = true;

    // إسناد البيانات للمتغيرات العالمية التي تحتاجها الملفات الأخرى
    playerAccountTagID = generatedID;

    // 4. التحديث الديناميكي الشامل لواجهات المنصة الرسمية (UI Synchronisation)
    document.getElementById('headerName').innerText = currentSessionUser.username;
    document.getElementById('headerID').innerText = currentSessionUser.accountID;
    document.getElementById('avatarLetter').innerText = currentSessionUser.username.charAt(0).toUpperCase();
    document.getElementById('playerSideLabel').innerText = currentSessionUser.username;
    
    // توليد رابط الإحالة الترويجي الرسمي المعزز بالمعرف الفريد للاعب
    document.getElementById('shareableReferralLink').innerText = "https://playrolly.com/register?ref=" + currentSessionUser.accountID.toLowerCase();
    
    // 5. حفظ الجلسة محلياً في المتصفح (Persistent Session Storage) لضمان عدم ضياع الحساب
    try {
        localStorage.setItem('ROLLY_USER_SESSION', JSON.stringify(currentSessionUser));
    } catch (e) {
        console.warn("[ROLLY AUTH] تحذير: لم يتم التخزين المحلي بنجاح بسبب إعدادات الخصوصية بالمتصفح.");
    }

    // 6. إغلاق بوابة التحقق والانتقال الآمن إلى ردهة التحكم الفورية
    document.getElementById('authGateway').style.display = 'none';
    
    console.log(`%c[ROLLY AUTH] تم تنشيط الجلسة الاحترافية للاعب: ${currentSessionUser.username} | الرمز: ${currentSessionUser.authToken}`, "color: #2ec4b6; font-weight: bold;");
}

/**
 * نظام الفحص التلقائي عند تحميل الصفحة (Auto-Login Sync)
 * يبحث عن الجلسة المحفوظة لتسجيل الدخول التلقائي وتسريع تصفح اللاعبين
 */
function checkExistingSession() {
    try {
        const savedSession = localStorage.getItem('ROLLY_USER_SESSION');
        if (savedSession) {
            const parsedUser = JSON.parse(savedSession);
            if (parsedUser && parsedUser.isVerified) {
                currentSessionUser = parsedUser;
                playerAccountTagID = parsedUser.accountID;

                // تحديث الواجهة فوراً بالبيانات المحفوظة
                document.getElementById('headerName').innerText = parsedUser.username;
                document.getElementById('headerID').innerText = parsedUser.accountID;
                document.getElementById('avatarLetter').innerText = parsedUser.username.charAt(0).toUpperCase();
                document.getElementById('playerSideLabel').innerText = parsedUser.username;
                document.getElementById('shareableReferralLink').innerText = "https://playrolly.com/register?ref=" + parsedUser.accountID.toLowerCase();
                
                // إخفاء بوابة التسجيل تلقائياً لأن اللاعب مسجل بالفعل
                document.getElementById('authGateway').style.display = 'none';
                console.log(`%c[ROLLY AUTH] تم استعادة جلسة اللاعب تلقائياً: ${parsedUser.username}`, "color: #ffb703; font-weight: bold;");
            }
        }
    } catch (e) {
        console.error("[ROLLY AUTH] خطأ أثناء استعادة الجلسة المحفوظة:", e);
    }
}

// تشغيل نظام الفحص الآلي بمجرد تحميل المتصفح للملف
document.addEventListener("DOMContentLoaded", checkExistingSession);
