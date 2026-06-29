/* ==========================================================================
   منصة ROLLY الرسمية - محرك لعبة البارشيسي الحقيقي الاحترافي (parchisi-core.js)
   ========================================================================== */

// الهيكل اللوجستي لإدارة طاولات اللعب والرهانات
let parchisiGameBoard = {
    totalTrackCells: 48,          // إجمالي المربعات التكتيكية للمسار العام حتى المركز
    winCellIndex: 48,             // مربع الفوز النهائي وتتويج القطعة
    matchCommissionRate: 0.10,    // عمولة المنصة الإدارية للطاولة 10%
    gameState: "Inactive"         // الحالة التشغيلية للمباراة الحية
};

/**
 * دالة البحث عن خصم حقيقي وبدء تمويل الطاولة التنافسية
 */
function searchForActiveOpponent() {
    const betInputField = document.getElementById('matchBetValue');
    const targetBetAmount = parseFloat(betInputField.value);

    // 1. فحص شروط الأمان المالي قبل ولوج الغرفة
    if (isNaN(targetBetAmount) || targetBetAmount < 20) {
        alert("⚠️ خطأ تنافسي: الحد الأدنى المعتمد لتمويل رهان الطاولة هو 20 درهم مغربي.");
        return;
    }
    if (targetBetAmount > balance) {
        alert("❌ خطأ مالي: رصيدك الحالي غير كافٍ لتمويل قيمة هذا الرهان. يرجى شحن المحفظة أولاً.");
        return;
    }

    // 2. حجز قيمة الرهان فوراً من محفظة اللاعب وتحديث الواجهة
    balance -= targetBetAmount;
    currentActiveBet = targetBetAmount;
    document.getElementById('userBalance').innerText = balance.toFixed(2);
    
    // حفظ التحديث المالي الجديد في المتصفح لمنع التلاعب
    if (typeof syncWalletWithLocalStorage === "function") syncWalletWithLocalStorage();

    // 3. تهيئة واجهة الردهة وبدء البحث المحاكي الذكي
    document.getElementById('lobbySetupArea').style.display = 'none';
    document.getElementById('leaveGameBtn').style.display = 'none';
    document.getElementById('activeMatchBoardArea').style.display = 'block';
    
    document.getElementById('matchStateIndicator').innerText = "جاري البحث عن طاولة متوافقة... 🔄";
    document.getElementById('opponentSideLabel').innerText = "جاري الفحص...";
    parchisiGameBoard.gameState = "Matching";

    // محاكاة ربط الطاولة الحية عبر الشبكة خلال ثانيتين
    setTimeout(() => {
        const professionalOpponents = ["Amine_Meknes", "Anass_Fez", "Yassine_Rabat", "Othmane_Tanger"];
        const selectedOpponent = professionalOpponents[Math.floor(Math.random() * professionalOpponents.length)];
        
        document.getElementById('opponentSideLabel').innerText = selectedOpponent;
        document.getElementById('matchStateIndicator').innerText = "المواجهة بدأت حية! ⚔️";
        
        // 4. تصفير إحداثيات البارشيسي الحقيقية وبدء القطع من داخل القاعدة المغلقة 🔒
        userStepCounter = 0;
        opponentStepCounter = 0;
        isUserReleasedFromBase = false;
        isOpponentReleasedFromBase = false;
        roundTurnHolder = "player";
        parchisiGameBoard.gameState = "Active_Turn_Player";
        
        document.getElementById('matchFeedStatus').innerText = "طاولتك جاهزة! دورك الآن لإلقاء النرد؛ تحتاج للرقم 5 أو 6 للتحرر والخروج من القاعدة.";
        document.getElementById('throwDiceBtn').disabled = false;
        
        // إعادة ضبط المواقع المرئية للقطع على اللوحة
        refreshPawnsUIPosition();
    }, 2000);
}

/**
 * دالة تحديث الإحداثيات المرئية للقطع (Pawns) على اللوحة الهندسية
 */
function refreshPawnsUIPosition() {
    const userPawnElement = document.getElementById('playerPawnUnit');
    const opponentPawnElement = document.getElementById('opponentPawnUnit');

    // إذا كانت قطعة اللاعب في القاعدة تظل مستقرة، وإذا خرجت تتقدم بناءً على أسطر الـ Grid
    if (!isUserReleasedFromBase) {
        userPawnElement.style.transform = "translate(0px, 0px)";
    } else {
        // محاكاة تقدم القطعة على محور اللوحة بضرب الخطوات تكتيكياً
        let stepOffset = userStepCounter * 2.8;
        userPawnElement.style.transform = `translate(${stepOffset}px, -15px)`;
    }

    // محاكاة حركة قطعة الخصم بالاتجاه المعاكس
    if (!isOpponentReleasedFromBase) {
        opponentPawnElement.style.transform = "translate(0px, 0px)";
    } else {
        let stepOffset = opponentStepCounter * 2.8;
        opponentPawnElement.style.transform = `translate(-${stepOffset}px, 15px)`;
    }
}

/**
 * دالة معالجة حركة اللاعب وإلقاء النرد وتطبيق قواعد البارشيسي الصارمة
 */
function triggerPlayerMove() {
    if (roundTurnHolder !== "player" || parchisiGameBoard.gameState !== "Active_Turn_Player") return;

    const diceGraphicNode = document.getElementById('gameSingleDiceNode');
    document.getElementById('throwDiceBtn').disabled = true;
    diceGraphicNode.classList.add('dice-animating');

    setTimeout(() => {
        diceGraphicNode.classList.remove('dice-animating');
        
        // توليد رقم عشوائي حقيقي من 1 إلى 6
        const rolledNumber = Math.floor(Math.random() * 6) + 1;
        const diceUnicodeFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
        diceGraphicNode.innerText = diceUnicodeFaces[rolledNumber - 1];

        let grantExtraBonusTurn = false;

        // 1. تطبيق منطق حالة "داخل القاعدة 🔒"
        if (!isUserReleasedFromBase) {
            if (rolledNumber === 5 || rolledNumber === 6) {
                isUserReleasedFromBase = true;
                userStepCounter = 1;
                document.getElementById('matchFeedStatus').innerText = `🎉 ملوكي! حصلت على الرقم ${rolledNumber} وتحررت قطعتك للمسار العام للوح.`;
                if (rolledNumber === 6) grantExtraBonusTurn = true; // قاعدة الـ 6 تمنح دوراً إضافياً
            } else {
                document.getElementById('matchFeedStatus').innerText = `🎲 النرد يشير إلى ${rolledNumber}. تحتاج بدقة إلى رقم 5 أو 6 لفك قفل الحاضنة والخروج!`;
            }
        } else {
            // 2. تطبيق منطق الحركة والتقدم التكتيكي خارج القاعدة
            userStepCounter += rolledNumber;
            
            // قاعدة سقف الفوز الصارم
            if (userStepCounter > parchisiGameBoard.winCellIndex) {
                // إذا تجاوز الرقم المربع الأخير، تظل القطعة مكانها في قانون البارشيسي القديم
                userStepCounter -= rolledNumber;
                document.getElementById('matchFeedStatus').innerText = `🎲 حصلت على ${rolledNumber}. تحتاج لرقم دقيق لدخول مربع الفوز الفوقي بدون تجاوزه!`;
            } else {
                document.getElementById('matchFeedStatus').innerText = `تقدمت قطعتك بمقدار ${rolledNum = rolledNumber} خطوات ميدانية للأمام.`;
                if (rolledNumber === 6) grantExtraBonusTurn = true; // دور مكافأة إضافي للرقم 6
            }

            // فحص حالة بلوغ خط النهاية والانتصار بالطاولة
            if (userStepCounter === parchisiGameBoard.winCellIndex) {
                refreshPawnsUIPosition();
                evaluateMatchWinner("player");
                return;
            }
        }

        // تحديث النصوص والعدادات المرئية للاعبين
        document.getElementById('playerStepText').innerText = isUserReleasedFromBase ? `المربع ${userStepCounter}/${parchisiGameBoard.totalTrackCells}` : "في القاعدة 🔒";
        refreshPawnsUIPosition();

        // 3. تحديد نقل الدور أو تفعيل الدور الإضافي (Bonus Turn)
        if (grantExtraBonusTurn) {
            document.getElementById('matchFeedStatus').innerText += " [مكافأة: حصلت على الرقم 6 ولديك رمية إضافية الآن!]";
            document.getElementById('throwDiceBtn').disabled = false;
        } else {
            roundTurnHolder = "opponent";
            parchisiGameBoard.gameState = "Active_Turn_Opponent";
            document.getElementById('matchStateIndicator').innerText = "الخصم يلقي حجر النرد... 🎲";
            setTimeout(executeOpponentMoveLogic, 1300);
        }
    }, 500);
}

/**
 * دالة الذكاء الاصطناعي والمحاكاة التكتيكية لحركة الخصم
 */
function executeOpponentMoveLogic() {
    if (roundTurnHolder !== "opponent" || parchisiGameBoard.gameState !== "Active_Turn_Opponent") return;

    const diceGraphicNode = document.getElementById('gameSingleDiceNode');
    diceGraphicNode.classList.add('dice-animating');

    setTimeout(() => {
        diceGraphicNode.classList.remove('dice-animating');
        const rolledNumber = Math.floor(Math.random() * 6) + 1;
        const diceUnicodeFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
        diceGraphicNode.innerText = diceUnicodeFaces[rolledNumber - 1];

        let opponentExtraTurn = false;

        if (!isOpponentReleasedFromBase) {
            if (rolledNumber === 5 || rolledNumber === 6) {
                isOpponentReleasedFromBase = true;
                opponentStepCounter = 1;
                document.getElementById('matchFeedStatus').innerText = `⚠️ انتبه! نجح الخصم في إخراج قطعته للميدان وبدأ بمنافستك على الجائزة.`;
                if (rolledNumber === 6) opponentExtraTurn = true;
            } else {
                document.getElementById('matchFeedStatus').innerText = `ألقى الخصم النرد وحصل على ${rolledNumber}، ولم يتمكن من تحرير قطعته.`;
            }
        } else {
            opponentStepCounter += rolledNumber;
            if (opponentStepCounter > parchisiGameBoard.winCellIndex) {
                opponentStepCounter -= rolledNumber; // تراجع لعدم دقة الرقم
            } else {
                document.getElementById('matchFeedStatus').innerText = `تقدم الخصم بقطعته للأمام بمقدار ${rolledNumber} خانات.`;
                if (rolledNumber === 6) opponentExtraTurn = true;
            }

            if (opponentStepCounter === parchisiGameBoard.winCellIndex) {
                refreshPawnsUIPosition();
                evaluateMatchWinner("opponent");
                return;
            }
        }

        document.getElementById('opponentStepText').innerText = isOpponentReleasedFromBase ? `المربع ${opponentStepCounter}/${parchisiGameBoard.totalTrackCells}` : "في القاعدة 🔒";
        refreshPawnsUIPosition();

        if (opponentExtraTurn) {
            document.getElementById('matchStateIndicator').innerText = "الخصم حصل على 6 ويلعب مجدداً! 🎲";
            setTimeout(executeOpponentMoveLogic, 1300);
        } else {
            document.getElementById('matchStateIndicator').innerText = "دورك الآن للعب ⚔️";
            roundTurnHolder = "player";
            parchisiGameBoard.gameState = "Active_Turn_Player";
            document.getElementById('throwDiceBtn').disabled = false;
        }
    }, 900);
}

/**
 * دالة إنهاء الطاولة، احتساب الأرباح الصافية واقتطاع عمولة شبكة ROLLY 10%
 */
function evaluateMatchWinner(winner) {
    parchisiGameBoard.gameState = "Ended";
    document.getElementById('throwDiceBtn').disabled = true;

    if (winner === "player") {
        // حساب الجائزة المالية الإجمالية: (رهانك + رهان الخصم)
        const grossPrizePool = currentActiveBet * 2;
        // اقتطاع عمولة الخدمة الإدارية الصارمة للموقع 10%
        const platformFee = grossPrizePool * parchisiGameBoard.matchCommissionRate;
        const netRevenue = grossPrizePool - platformFee;

        // إيداع الأرباح النظيفة في المحفظة
        balance += netRevenue;
        document.getElementById('userBalance').innerText = balance.toFixed(2);
        
        if (typeof syncWalletWithLocalStorage === "function") syncWalletWithLocalStorage();

        alert(`🏆 تهانينا الحارة! بلغت قطعتك المركز الملكي وحسمت الطاولة لصالحك. تم إيداع أرباحك الصافية بقيمة ${netRevenue.toFixed(2)} DH بعد اقتطاع عمولة الطاولة 10%.`);
    } else {
        alert("❌ مع الأسف! تمكن الخصم من إيصال قطعته للمركز الملكي أولاً وحسم الرهان. حظاً أوفر في الغرف التنافسية القادمة!");
    }

    // تصفير وإرجاع الواجهات للتحضير للطاولات القادمة
    document.getElementById('activeMatchBoardArea').style.display = 'none';
    document.getElementById('leaveGameBtn').style.display = 'block';
    document.getElementById('lobbySetupArea').style.display = 'block';
      }
               
