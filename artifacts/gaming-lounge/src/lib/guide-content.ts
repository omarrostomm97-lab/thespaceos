export type GuideRole = "owner" | "manager" | "cashier" | "buffet_worker";

export interface GuideSection {
  overview: string;
  steps: string[];
  buttons: string[];
  fields: string[];
  bestPractices: string[];
  commonMistakes: string[];
}

export interface VideoScene {
  scene: number;
  voiceoverEN: string;
  voiceoverAR: string;
  screenAction: string;
}

export interface ModuleGuide {
  id: string;
  nameEN: string;
  nameAR: string;
  descriptionEN: string;
  descriptionAR: string;
  roles: GuideRole[];
  guideEN: GuideSection;
  guideAR: GuideSection;
  videoScript: VideoScene[];
}

export const guideModules: ModuleGuide[] = [
  {
    id: "dashboard",
    nameEN: "Dashboard",
    nameAR: "اللوحة الرئيسية",
    descriptionEN: "Central command view for live KPIs, active sessions, and revenue.",
    descriptionAR: "نظرة شاملة على المؤشرات الحية والجلسات النشطة والإيرادات.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "The Dashboard is your real-time command center. It shows active sessions, today's revenue, pending orders, and low-stock alerts at a glance. Tabs break down the view into Overview, Sales, Details, and Shifts.",
      steps: [
        "Open the app — the Dashboard loads automatically for owners and managers.",
        "Check the four KPI cards at the top: Active Sessions, Revenue Today, Pending Orders, Low Stock Alerts.",
        "Switch tabs (Overview / Sales / Details / Shifts) to explore different data views.",
        "Use the period selector (Today / Week / Month) to change the revenue reporting range.",
        "Click 'Open Shift' if no shift is currently active before starting operations.",
        "Use Quick Actions to jump to POS, Rooms, Kitchen, or Orders instantly.",
        "Export Report to download a PDF snapshot of current metrics.",
      ],
      buttons: [
        "Open Shift — opens the shift management dialog to start a new shift.",
        "Export Report — generates and downloads a PDF summary.",
        "View All — navigates to the full session or order list.",
        "Manage — opens a specific session for control.",
        "Quick Action cards — shortcut navigation to key modules.",
      ],
      fields: [
        "Period selector: Today / Week / Month — filters all KPIs and charts.",
        "Active Sessions count — number of rooms currently being used.",
        "Revenue Today — sum of completed payments in the current shift.",
        "Pending Orders — orders received but not yet delivered.",
        "Low Stock Alerts — inventory items below their minimum threshold.",
      ],
      bestPractices: [
        "Always open a shift before starting operations so revenue is tracked correctly.",
        "Check the Dashboard first thing each morning to spot issues early.",
        "Use the Finance Snapshot widget for a quick profit/loss overview without navigating away.",
        "Monitor Pending Orders to ensure kitchen backlog doesn't build up.",
      ],
      commonMistakes: [
        "Forgetting to open a shift — revenue won't be attributed to any shift.",
        "Misreading KPI numbers as all-time totals — they always reflect the selected period.",
        "Ignoring Low Stock Alerts until you run out of product mid-service.",
      ],
    },
    guideAR: {
      overview:
        "اللوحة الرئيسية هي مركز القيادة في الوقت الفعلي. تعرض الجلسات النشطة وإيرادات اليوم والطلبات المعلقة وتنبيهات المخزون دفعة واحدة. تنقسم إلى تبويبات: نظرة عامة، المبيعات، التفصيل، الورديات.",
      steps: [
        "افتح التطبيق — تُحمَّل اللوحة الرئيسية تلقائياً للمالك والمدير.",
        "تحقق من بطاقات المؤشرات الأربع: الجلسات النشطة، الإيرادات اليوم، الطلبات المعلقة، تنبيهات المخزون.",
        "غيّر التبويبات (نظرة عامة / المبيعات / التفصيل / الورديات) لاستكشاف طرق عرض مختلفة.",
        "استخدم محدد الفترة (اليوم / الأسبوع / الشهر) لتغيير نطاق الإيرادات.",
        "اضغط 'فتح وردية' إذا لم تكن هناك وردية نشطة قبل بدء العمليات.",
        "استخدم الإجراءات السريعة للانتقال فوراً إلى نقطة البيع أو الغرف أو المطبخ أو الطلبات.",
        "اضغط 'تصدير التقرير' لتنزيل لقطة PDF من المؤشرات الحالية.",
      ],
      buttons: [
        "فتح وردية — يفتح نافذة إدارة الورديات لبدء وردية جديدة.",
        "تصدير التقرير — يُولّد ويُنزّل ملخصاً بصيغة PDF.",
        "عرض الكل — ينتقل إلى قائمة الجلسات أو الطلبات الكاملة.",
        "إدارة — يفتح جلسة محددة للتحكم فيها.",
        "بطاقات الإجراءات السريعة — اختصارات تنقل إلى الوحدات الرئيسية.",
      ],
      fields: [
        "محدد الفترة: اليوم / الأسبوع / الشهر — يُصفّي جميع المؤشرات والرسوم البيانية.",
        "عدد الجلسات النشطة — عدد الغرف قيد الاستخدام حالياً.",
        "الإيرادات اليوم — مجموع المدفوعات المكتملة في الوردية الحالية.",
        "الطلبات المعلقة — الطلبات المستلمة والتي لم تُسلَّم بعد.",
        "تنبيهات المخزون — العناصر التي وصلت إلى أقل من الحد الأدنى.",
      ],
      bestPractices: [
        "افتح وردية دائماً قبل بدء العمليات حتى تُسجَّل الإيرادات بشكل صحيح.",
        "راجع اللوحة الرئيسية أول شيء كل صباح للكشف عن المشكلات مبكراً.",
        "استخدم اللمحة المالية للاطلاع على الأرباح والخسائر دون التنقل بعيداً.",
        "راقب الطلبات المعلقة حتى لا يتراكم الضغط على المطبخ.",
      ],
      commonMistakes: [
        "نسيان فتح وردية — لن تُنسب الإيرادات لأي وردية.",
        "قراءة أرقام المؤشرات كإجماليات كل الوقت — هي دائماً تعكس الفترة المحددة.",
        "تجاهل تنبيهات المخزون حتى نفاد المنتج أثناء الخدمة.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Welcome to Gaming Lounge OS. Let's start with the Dashboard — your real-time command center.",
        voiceoverAR: "مرحباً بك في نظام جيمينج لاونج. لنبدأ باللوحة الرئيسية — مركز القيادة في الوقت الفعلي.",
        screenAction: "Show the full Dashboard page with all four KPI cards visible.",
      },
      {
        scene: 2,
        voiceoverEN: "At the top, four cards show your most critical numbers: active sessions, today's revenue, pending orders, and low stock alerts.",
        voiceoverAR: "في الأعلى، أربع بطاقات تعرض أهم أرقامك: الجلسات النشطة، إيرادات اليوم، الطلبات المعلقة، وتنبيهات المخزون.",
        screenAction: "Zoom in and highlight each KPI card in sequence.",
      },
      {
        scene: 3,
        voiceoverEN: "Use the period selector to switch between Today, Week, and Month views instantly.",
        voiceoverAR: "استخدم محدد الفترة للتبديل بين عروض اليوم والأسبوع والشهر فوراً.",
        screenAction: "Click Today, then Week, then Month — show numbers updating.",
      },
      {
        scene: 4,
        voiceoverEN: "Always open a shift before starting operations. Revenue won't track without it.",
        voiceoverAR: "افتح وردية دائماً قبل بدء العمليات. لن تُتابَع الإيرادات بدونها.",
        screenAction: "Click 'Open Shift' button and show the shift dialog.",
      },
    ],
  },

  {
    id: "sessions",
    nameEN: "Sessions",
    nameAR: "الجلسات",
    descriptionEN: "Start, pause, resume, and bill gaming sessions per room.",
    descriptionAR: "بدء الجلسات وإيقافها واستئنافها وتحصيل فاتورتها لكل غرفة.",
    roles: ["owner", "manager", "cashier"],
    guideEN: {
      overview:
        "Sessions track the time a customer spends in a gaming room. Each session records start time, pauses, orders added, and final billing. The Cashier can start and end sessions; Managers can review history and apply discounts.",
      steps: [
        "Navigate to Rooms/Assets and find an available room.",
        "Click 'Start Play' on a room card — a new session opens immediately.",
        "The session timer starts counting; cost accumulates based on the hourly rate.",
        "To pause the session, open Sessions, find the active session, and click 'Pause'.",
        "To resume, click 'Resume' on the paused session card.",
        "When the customer is done, click 'End & Bill' to open the checkout dialog.",
        "Select a payment method (Cash / InstaPay / Visa), enter the received amount.",
        "Confirm payment — the session closes and the payment is recorded.",
        "For discounts, click 'Request Discount' and submit to manager for approval.",
      ],
      buttons: [
        "Start Play — initiates a new session on the selected room.",
        "Pause — temporarily stops the billing timer.",
        "Resume — restarts the timer after a pause.",
        "End & Bill — opens checkout to collect final payment.",
        "Session Details & Orders — shows full session breakdown.",
        "Request Discount — sends a discount approval request to the manager.",
        "Confirm Payment — finalizes the session and records the transaction.",
      ],
      fields: [
        "Payment Method: Cash, InstaPay, or Visa.",
        "Received Amount — the amount handed by the customer.",
        "Change Due — automatically calculated as received minus total.",
        "Discount Type: Session time or order discount.",
        "Discount Value: Percentage or fixed amount.",
        "Reason for Discount — required text field for audit trail.",
      ],
      bestPractices: [
        "Always verify the room is available before starting a new session.",
        "Encourage cashiers to add orders directly to the session rather than as separate POS transactions for cleaner billing.",
        "Pause sessions during legitimate breaks (e.g., customer steps out briefly) to avoid overcharging.",
        "Review session history daily to spot any unclosed sessions.",
      ],
      commonMistakes: [
        "Starting a session without an open shift — payments won't be recorded.",
        "Forgetting to end a session when a customer leaves — the timer keeps running.",
        "Entering a received amount lower than the total — system will show an error.",
        "Submitting a discount request without a reason — will be harder to audit.",
      ],
    },
    guideAR: {
      overview:
        "تتتبع الجلسات الوقت الذي يقضيه العميل في غرفة اللعب. تسجّل كل جلسة وقت البداية والإيقافات والطلبات المضافة والفاتورة النهائية. يستطيع الكاشير بدء الجلسات وإنهاءها؛ يستطيع المديرون مراجعة السجل وتطبيق الخصومات.",
      steps: [
        "انتقل إلى الغرف واعثر على غرفة متاحة.",
        "اضغط 'بدء اللعب' على بطاقة الغرفة — تفتح جلسة جديدة فوراً.",
        "يبدأ عداد الجلسة؛ تتراكم التكلفة بناءً على السعر بالساعة.",
        "لإيقاف الجلسة مؤقتاً، افتح صفحة الجلسات واضغط 'إيقاف مؤقت'.",
        "للاستئناف، اضغط 'استئناف' على بطاقة الجلسة الموقوفة.",
        "عند انتهاء العميل، اضغط 'إنهاء وحساب' لفتح نافذة الدفع.",
        "اختر طريقة الدفع (نقداً / إنستاباي / فيزا) وأدخل المبلغ المستلم.",
        "أكّد الدفع — تُغلق الجلسة ويُسجَّل الدفع.",
        "للخصومات، اضغط 'طلب خصم' وأرسله للمدير للموافقة.",
      ],
      buttons: [
        "بدء اللعب — يبدأ جلسة جديدة على الغرفة المحددة.",
        "إيقاف مؤقت — يوقف عداد الفوترة مؤقتاً.",
        "استئناف — يعيد تشغيل العداد بعد الإيقاف.",
        "إنهاء وحساب — يفتح الدفع لاستلام المبلغ النهائي.",
        "تفاصيل الجلسة والطلبات — يعرض التفاصيل الكاملة للجلسة.",
        "طلب خصم — يرسل طلب موافقة على الخصم للمدير.",
        "تأكيد الدفع — يُنهي الجلسة ويُسجّل المعاملة.",
      ],
      fields: [
        "طريقة الدفع: نقداً أو إنستاباي أو فيزا.",
        "المبلغ المستلم — المبلغ الذي سلّمه العميل.",
        "الفكة — تُحسَب تلقائياً (المستلم ناقص الإجمالي).",
        "نوع الخصم: على وقت اللعب أو على طلب.",
        "قيمة الخصم: نسبة مئوية أو مبلغ ثابت.",
        "سبب الخصم — حقل نصي إلزامي لمسار المراجعة.",
      ],
      bestPractices: [
        "تأكد دائماً أن الغرفة متاحة قبل بدء جلسة جديدة.",
        "شجّع الكاشيرين على إضافة الطلبات مباشرة للجلسة بدلاً من معاملات POS منفصلة لفواتير أنظف.",
        "أوقف الجلسة مؤقتاً أثناء الاستراحات المشروعة لتجنب الفوترة الزائدة.",
        "راجع سجل الجلسات يومياً لاكتشاف أي جلسات لم تُغلق.",
      ],
      commonMistakes: [
        "بدء جلسة دون وردية مفتوحة — لن تُسجَّل المدفوعات.",
        "نسيان إنهاء الجلسة عند مغادرة العميل — يستمر العداد في الضبط.",
        "إدخال مبلغ مستلم أقل من الإجمالي — سيظهر خطأ في النظام.",
        "إرسال طلب خصم بدون سبب — يصعب مراجعته لاحقاً.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Sessions are how you track and bill time in each gaming room. Let's walk through the full session lifecycle.",
        voiceoverAR: "الجلسات هي الطريقة التي تتتبع بها الوقت وتفترضه في كل غرفة لعب. دعنا نستعرض دورة حياة الجلسة الكاملة.",
        screenAction: "Show the Sessions page with a mix of active and paused sessions.",
      },
      {
        scene: 2,
        voiceoverEN: "To start a session, go to Rooms, find an available room, and click 'Start Play'. The timer begins immediately.",
        voiceoverAR: "لبدء جلسة، انتقل إلى الغرف، ابحث عن غرفة متاحة، واضغط 'بدء اللعب'. يبدأ العداد فوراً.",
        screenAction: "Click 'Start Play' on a room card. Show the session appearing in the active list.",
      },
      {
        scene: 3,
        voiceoverEN: "When the customer is done, click 'End & Bill', choose a payment method, enter the amount received, and confirm.",
        voiceoverAR: "عند انتهاء العميل، اضغط 'إنهاء وحساب'، اختر طريقة الدفع، أدخل المبلغ المستلم، وأكّد.",
        screenAction: "Open checkout dialog, select Cash, enter amount, click Confirm Payment.",
      },
      {
        scene: 4,
        voiceoverEN: "Need to give a discount? Click 'Request Discount', fill in the details, and submit for manager approval.",
        voiceoverAR: "تريد منح خصم؟ اضغط 'طلب خصم'، أدخل التفاصيل، وأرسله للموافقة من المدير.",
        screenAction: "Open discount dialog, fill percentage and reason, click Submit.",
      },
    ],
  },

  {
    id: "assets",
    nameEN: "Assets / Devices",
    nameAR: "الغرف والأجهزة",
    descriptionEN: "Manage gaming rooms, device types, and hourly pricing.",
    descriptionAR: "إدارة غرف اللعب وأنواع الأجهزة والأسعار بالساعة.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "Assets are the physical gaming rooms or stations (PlayStation, PC, Billiard, etc.) in your venue. You set a name, type, and hourly rate for each. The QR code generated per asset allows customers to order food and drinks directly from their room.",
      steps: [
        "Navigate to 'Rooms' from the sidebar.",
        "Click 'Add Room' to create a new gaming station.",
        "Fill in the Arabic name, optional English name, device type, and hourly price.",
        "Click Save — the room appears on the grid with its status indicator.",
        "To edit an existing room, click the edit (pencil) icon on its card.",
        "To generate or regenerate a QR code for a room, click the QR icon and then 'Generate' or 'Regenerate QR'.",
        "Print the QR code and place it on the table so customers can self-order.",
        "View a room's full session history by clicking its history icon.",
      ],
      buttons: [
        "Add Room — opens the create-room dialog.",
        "Edit (pencil icon) — opens the edit dialog for an existing room.",
        "Start Play — starts a new session on that room.",
        "View Session — opens the currently active session for the room.",
        "QR icon — opens the QR code panel.",
        "Regenerate QR — invalidates the old QR and creates a new one.",
        "Print — sends the QR card to the printer.",
        "History icon — shows the full session history for this room.",
      ],
      fields: [
        "Arabic Name (required) — displayed on all screens and receipts.",
        "English Name (optional) — shown alongside Arabic for bilingual staff.",
        "Device Type — PlayStation, PC, Billiard, Air Hockey, Babyfoot, Other.",
        "Hourly Price (EGP) — the rate used to calculate session billing.",
      ],
      bestPractices: [
        "Use clear, consistent names (e.g., PS5-1, PS5-2) to avoid confusion during busy periods.",
        "Laminate and attach QR codes to each table so customers always have access.",
        "Regenerate QR codes if a code is damaged or if you suspect misuse.",
        "Set accurate hourly rates before opening to avoid billing discrepancies.",
      ],
      commonMistakes: [
        "Setting hourly price to 0 — sessions will bill customers nothing.",
        "Forgetting to regenerate QR after reprinting — the old code still works until regenerated.",
        "Duplicating room names — makes it hard to distinguish rooms in session lists.",
      ],
    },
    guideAR: {
      overview:
        "الأصول هي غرف الألعاب الفعلية أو المحطات (بلايستيشن، PC، بلياردو...) في مركزك. تضبط اسماً ونوعاً وسعراً بالساعة لكل منها. رمز QR الذي يُولَّد لكل أصل يتيح للعملاء طلب الطعام والمشروبات من غرفتهم.",
      steps: [
        "انتقل إلى 'الغرف' من الشريط الجانبي.",
        "اضغط 'إضافة غرفة' لإنشاء محطة لعب جديدة.",
        "أدخل الاسم بالعربية، والاسم الاختياري بالإنجليزية، ونوع الجهاز، والسعر بالساعة.",
        "اضغط حفظ — تظهر الغرفة على الشبكة مع مؤشر حالتها.",
        "لتعديل غرفة موجودة، اضغط أيقونة التعديل على بطاقتها.",
        "لإنشاء أو تجديد رمز QR لغرفة، اضغط أيقونة QR ثم 'إنشاء' أو 'تجديد الكود'.",
        "اطبع رمز QR وضعه على الطاولة حتى يتمكن العملاء من الطلب الذاتي.",
        "اعرض السجل الكامل لجلسات الغرفة بالضغط على أيقونة السجل.",
      ],
      buttons: [
        "إضافة غرفة — يفتح نافذة إنشاء الغرفة.",
        "تعديل (أيقونة القلم) — يفتح نافذة التعديل لغرفة موجودة.",
        "بدء اللعب — يبدأ جلسة جديدة على تلك الغرفة.",
        "عرض الجلسة — يفتح الجلسة النشطة الحالية للغرفة.",
        "أيقونة QR — يفتح لوحة رمز QR.",
        "تجديد الكود — يُبطل رمز QR القديم وينشئ رمزاً جديداً.",
        "طباعة — يرسل بطاقة QR إلى الطابعة.",
        "أيقونة السجل — تعرض السجل الكامل لجلسات هذه الغرفة.",
      ],
      fields: [
        "الاسم بالعربية (مطلوب) — يظهر على جميع الشاشات والإيصالات.",
        "الاسم بالإنجليزية (اختياري) — يُعرض جانب العربية للموظفين ثنائيي اللغة.",
        "نوع الجهاز — بلايستيشن، PC، بلياردو، هوكي الهواء، كرة القدم المصغرة، أخرى.",
        "السعر بالساعة (ج.م) — المعدل المستخدم لحساب فاتورة الجلسة.",
      ],
      bestPractices: [
        "استخدم أسماء واضحة ومتسقة (مثل PS5-1، PS5-2) لتجنب الالتباس في أوقات الذروة.",
        "ابدأ رموز QR وألصقها على كل طاولة حتى يتمكن العملاء دائماً من الوصول إليها.",
        "جدّد رموز QR إذا تلفت أو إذا اشتبهت في سوء الاستخدام.",
        "اضبط أسعار الساعة بدقة قبل الفتح لتجنب التناقضات في الفواتير.",
      ],
      commonMistakes: [
        "ضبط سعر الساعة على صفر — لن تُحصّل الجلسات من العملاء شيئاً.",
        "نسيان تجديد QR بعد إعادة الطباعة — الكود القديم لا يزال يعمل حتى يُجدَّد.",
        "تكرار أسماء الغرف — يصعّب التمييز بين الغرف في قوائم الجلسات.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Rooms are the foundation of your gaming lounge. Here's how to set them up and manage their QR codes.",
        voiceoverAR: "الغرف هي أساس مركز الألعاب. إليك كيفية إعدادها وإدارة رموز QR الخاصة بها.",
        screenAction: "Show the Assets grid with multiple rooms at different statuses.",
      },
      {
        scene: 2,
        voiceoverEN: "Click 'Add Room', fill in the name, type, and hourly rate, then save.",
        voiceoverAR: "اضغط 'إضافة غرفة'، أدخل الاسم والنوع والسعر بالساعة، ثم احفظ.",
        screenAction: "Open Add Room dialog, fill in fields, click Save. Room appears on grid.",
      },
      {
        scene: 3,
        voiceoverEN: "Each room has a QR code. Print it and put it on the table — customers scan it to order food.",
        voiceoverAR: "لكل غرفة رمز QR. اطبعه وضعه على الطاولة — يمسحه العملاء لطلب الطعام.",
        screenAction: "Click QR icon, show QR code panel, click Print.",
      },
    ],
  },

  {
    id: "pos",
    nameEN: "POS — Point of Sale",
    nameAR: "نقطة البيع",
    descriptionEN: "Fast order-taking for buffet and walk-in customers with cart and payment.",
    descriptionAR: "استلام الطلبات السريع لعملاء البوفيه والحضور المباشر مع سلة ودفع.",
    roles: ["owner", "manager", "cashier"],
    guideEN: {
      overview:
        "The POS (Point of Sale) is used by cashiers to quickly add items to a cart and collect payment for walk-in buffet customers or to add orders to an active gaming room session. Items are pulled from your product menu and can be filtered by category.",
      steps: [
        "Navigate to POS from the sidebar.",
        "Browse or search for products using the search bar.",
        "Filter by category by clicking a category tab.",
        "Click a product to add it to the cart (each click adds one unit).",
        "Adjust quantity in the cart using the + and - buttons.",
        "Toggle between 'Direct Order' (buffet/walk-in) and 'Add to Room' mode.",
        "For Direct Order: choose a payment method (Cash, InstaPay, Visa) and confirm.",
        "For Add to Room: select the active gaming room from the dropdown and send the order.",
        "The order appears in the KDS (kitchen display) and the orders list.",
      ],
      buttons: [
        "Search bar — filters products by name in real time.",
        "Category tabs — filters the product grid to show one category at a time.",
        "Product card — adds one unit of the item to the cart.",
        "Cart + / - buttons — adjust item quantity or remove from cart.",
        "Clear Cart — removes all items from the cart.",
        "Direct Order toggle — sets order to go to a payment flow directly.",
        "Add to Room toggle — attaches the order to an active gaming session.",
        "Confirm Payment — finalizes the order and records the transaction.",
        "Send to Room — sends the order to the selected room's session.",
      ],
      fields: [
        "Search input — filters product names in real time.",
        "Received Amount (Cash) — amount tendered by the customer.",
        "Room selector (Add to Room mode) — pick the active gaming session.",
      ],
      bestPractices: [
        "Train cashiers to use the search bar for speed during peak hours.",
        "Use 'Add to Room' mode for orders from gaming customers to keep billing consolidated.",
        "Review the order in the cart before confirming to avoid mistakes.",
        "Keep the product menu up-to-date so POS always shows current offerings.",
      ],
      commonMistakes: [
        "Processing a Direct Order when the customer is in a gaming session — the charge won't appear on the session bill.",
        "Adding the wrong quantity — always verify the cart total before confirming.",
        "Forgetting to select a room in 'Add to Room' mode — the system will prompt an error.",
      ],
    },
    guideAR: {
      overview:
        "نقطة البيع يستخدمها الكاشيرون لإضافة عناصر سريعاً إلى السلة وتحصيل المدفوعات لعملاء البوفيه أو الحاضرين مباشرة، أو لإضافة طلبات لجلسة لعب نشطة. تُؤخذ العناصر من قائمة منتجاتك ويمكن تصفيتها حسب الفئة.",
      steps: [
        "انتقل إلى نقطة البيع من الشريط الجانبي.",
        "تصفح أو ابحث عن المنتجات باستخدام شريط البحث.",
        "صفّ حسب الفئة بالضغط على تبويب الفئة.",
        "اضغط منتجاً لإضافته إلى السلة (كل ضغطة تضيف وحدة واحدة).",
        "اضبط الكمية في السلة باستخدام أزرار + و -.",
        "بدّل بين 'طلب مباشر' (بوفيه/مباشر) و'إضافة لغرفة'.",
        "للطلب المباشر: اختر طريقة الدفع (نقداً/إنستاباي/فيزا) وأكّد.",
        "للإضافة لغرفة: اختر غرفة اللعب النشطة من القائمة المنسدلة وأرسل الطلب.",
        "يظهر الطلب في شاشة المطبخ وقائمة الطلبات.",
      ],
      buttons: [
        "شريط البحث — يُصفّي المنتجات بالاسم في الوقت الفعلي.",
        "تبويبات الفئات — يُصفّي شبكة المنتجات لعرض فئة واحدة في كل مرة.",
        "بطاقة المنتج — تضيف وحدة واحدة من العنصر إلى السلة.",
        "أزرار + / - في السلة — تضبط كمية العنصر أو تزيله.",
        "إفراغ السلة — يزيل جميع العناصر من السلة.",
        "زر 'طلب مباشر' — يوجّه الطلب مباشرةً نحو تدفق الدفع.",
        "زر 'إضافة لغرفة' — يربط الطلب بجلسة لعب نشطة.",
        "تأكيد الدفع — يُنهي الطلب ويُسجّل المعاملة.",
        "إرسال للغرفة — يرسل الطلب لجلسة الغرفة المحددة.",
      ],
      fields: [
        "حقل البحث — يُصفّي أسماء المنتجات في الوقت الفعلي.",
        "المبلغ المستلم (نقداً) — المبلغ الذي قدّمه العميل.",
        "محدد الغرفة (في وضع 'إضافة لغرفة') — اختر جلسة اللعب النشطة.",
      ],
      bestPractices: [
        "درّب الكاشيرين على استخدام شريط البحث لتسريع العمل أثناء ساعات الذروة.",
        "استخدم وضع 'إضافة لغرفة' للطلبات من عملاء الألعاب لإبقاء الفاتورة موحدة.",
        "راجع الطلب في السلة قبل التأكيد لتجنب الأخطاء.",
        "حافظ على تحديث قائمة المنتجات حتى تعرض نقطة البيع دائماً ما هو متاح.",
      ],
      commonMistakes: [
        "معالجة طلب مباشر بينما العميل في جلسة لعب — لن تظهر التكلفة في فاتورة الجلسة.",
        "إضافة كمية خاطئة — تحقق دائماً من إجمالي السلة قبل التأكيد.",
        "نسيان اختيار غرفة في وضع 'إضافة لغرفة' — سيظهر خطأ في النظام.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "The Point of Sale lets cashiers take orders fast and collect payment — whether for the buffet or a gaming room.",
        voiceoverAR: "نقطة البيع تتيح للكاشيرين استلام الطلبات بسرعة وتحصيل المدفوعات — سواء للبوفيه أو غرفة اللعب.",
        screenAction: "Show the POS page with product grid and empty cart.",
      },
      {
        scene: 2,
        voiceoverEN: "Search or browse by category, then tap a product to add it to the cart. Adjust quantities with the plus and minus buttons.",
        voiceoverAR: "ابحث أو تصفح حسب الفئة، ثم اضغط منتجاً لإضافته للسلة. اضبط الكميات بأزرار + و -.",
        screenAction: "Click a category, add three products to cart, adjust one quantity.",
      },
      {
        scene: 3,
        voiceoverEN: "For buffet customers, select Direct Order, choose cash, enter the amount, and confirm.",
        voiceoverAR: "لعملاء البوفيه، اختر طلب مباشر، اختر نقداً، أدخل المبلغ، وأكّد.",
        screenAction: "Toggle Direct Order, select Cash, show received amount field, click Confirm.",
      },
      {
        scene: 4,
        voiceoverEN: "For gaming room customers, switch to Add to Room, select their room, and send the order directly to the kitchen.",
        voiceoverAR: "لعملاء غرف الألعاب، بدّل إلى 'إضافة لغرفة'، اختر غرفتهم، وأرسل الطلب مباشرةً للمطبخ.",
        screenAction: "Toggle Add to Room, select a room from dropdown, click Send to Room.",
      },
    ],
  },

  {
    id: "orders",
    nameEN: "Orders",
    nameAR: "الطلبات",
    descriptionEN: "Track all orders from QR menu and POS through delivery and returns.",
    descriptionAR: "تتبع جميع الطلبات من منيو QR ونقطة البيع حتى التسليم والمرتجعات.",
    roles: ["owner", "manager", "cashier", "buffet_worker"],
    guideEN: {
      overview:
        "The Orders page shows all incoming orders from both QR menu scanning and POS. Orders flow through statuses: New → Preparing → Ready → Delivered. Managers can cancel orders or process returns.",
      steps: [
        "Navigate to 'Orders' from the sidebar.",
        "View the Kanban-style columns: New, Preparing, Ready, Delivered.",
        "Click 'Start Preparing' on a new order to move it to the Preparing column.",
        "Click 'Ready for Delivery' to mark an order as ready.",
        "Click 'Confirm Delivery' to mark the order as delivered and bill the session.",
        "To cancel an order, click 'Cancel' and provide a reason.",
        "For returns, find the delivered order, click 'Request Return', select the item, and submit.",
        "Use the source filter (All / QR Menu / POS) to narrow the view.",
        "Search by order number or room name using the search bar.",
      ],
      buttons: [
        "Start Preparing — moves order status from New to Preparing.",
        "Ready for Delivery — moves status from Preparing to Ready.",
        "Confirm Delivery — finalizes delivery, billing the order to the session.",
        "Cancel Order — cancels the order with a required reason.",
        "Request Return — initiates a return request for a delivered item.",
        "View Details — opens the order drawer with full item breakdown and timeline.",
        "Close Order — closes a POS direct order after it's fully settled.",
      ],
      fields: [
        "Search input — filters by order number or room name.",
        "Source filter — All, QR Menu, or POS.",
        "Cancel reason — text field required when cancelling an order.",
        "Return quantity — how many units of an item to return.",
        "Return reason — why the item is being returned.",
      ],
      bestPractices: [
        "Process orders through the Kanban in real time to keep the kitchen and customers informed.",
        "Use the search bar to quickly find a specific room's order during busy periods.",
        "Always provide a cancel reason for audit and accountability.",
        "Process returns promptly so the customer's bill is corrected before checkout.",
      ],
      commonMistakes: [
        "Marking an order as delivered before it actually reaches the customer — billing starts immediately.",
        "Cancelling orders without a reason — reduces traceability for managers.",
        "Ignoring the 'New' column and letting orders pile up unacknowledged.",
      ],
    },
    guideAR: {
      overview:
        "تعرض صفحة الطلبات جميع الطلبات الواردة من مسح منيو QR ونقطة البيع. تتدفق الطلبات عبر حالات: جديد → قيد التحضير → جاهز → تم التسليم. يستطيع المديرون إلغاء الطلبات أو معالجة المرتجعات.",
      steps: [
        "انتقل إلى 'الطلبات' من الشريط الجانبي.",
        "اعرض الأعمدة على طراز كانبان: جديدة، قيد التحضير، جاهزة، تم التسليم.",
        "اضغط 'ابدأ التحضير' على طلب جديد لنقله إلى عمود التحضير.",
        "اضغط 'جاهز للتسليم' لتمييز الطلب كجاهز.",
        "اضغط 'تأكيد التسليم' لتمييز الطلب كمسلَّم وفوترة الجلسة.",
        "لإلغاء طلب، اضغط 'إلغاء' وأدخل سبباً.",
        "للمرتجعات، ابحث عن الطلب المسلَّم، اضغط 'طلب إرجاع'، اختر العنصر، وأرسل.",
        "استخدم فلتر المصدر (الكل / منيو QR / نقطة البيع) لتضييق العرض.",
        "ابحث برقم الطلب أو اسم الغرفة عبر شريط البحث.",
      ],
      buttons: [
        "ابدأ التحضير — ينقل حالة الطلب من جديد إلى قيد التحضير.",
        "جاهز للتسليم — ينقل الحالة من قيد التحضير إلى جاهز.",
        "تأكيد التسليم — يُنهي التسليم ويُدرج الطلب في فاتورة الجلسة.",
        "إلغاء الطلب — يلغي الطلب مع سبب مطلوب.",
        "طلب إرجاع — يبدأ طلب إرجاع لعنصر مسلَّم.",
        "عرض التفاصيل — يفتح درج الطلب مع التفاصيل الكاملة والجدول الزمني.",
        "إغلاق الطلب — يغلق طلب POS المباشر بعد التسوية الكاملة.",
      ],
      fields: [
        "حقل البحث — يُصفّي برقم الطلب أو اسم الغرفة.",
        "فلتر المصدر — الكل، منيو QR، أو نقطة البيع.",
        "سبب الإلغاء — حقل نصي مطلوب عند إلغاء طلب.",
        "كمية الإرجاع — عدد وحدات العنصر المراد إرجاعها.",
        "سبب الإرجاع — سبب إرجاع العنصر.",
      ],
      bestPractices: [
        "عالج الطلبات عبر كانبان في الوقت الفعلي لإبقاء المطبخ والعملاء على اطلاع.",
        "استخدم شريط البحث لإيجاد طلب غرفة محددة بسرعة أثناء أوقات الازدحام.",
        "أدخل دائماً سبب الإلغاء للمراجعة والمساءلة.",
        "عالج المرتجعات فوراً لتصحيح فاتورة العميل قبل الخروج.",
      ],
      commonMistakes: [
        "تمييز طلب كمسلَّم قبل وصوله فعلياً للعميل — تبدأ الفوترة فوراً.",
        "إلغاء الطلبات بدون سبب — يقلل من قابلية التتبع للمديرين.",
        "تجاهل عمود 'جديدة' والسماح بتراكم الطلبات دون معالجة.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "All orders — from QR menu scans and the POS — flow into the Orders page. Let's see how to manage them.",
        voiceoverAR: "جميع الطلبات — من مسح منيو QR ونقطة البيع — تتدفق إلى صفحة الطلبات. دعنا نرى كيفية إدارتها.",
        screenAction: "Show Orders page with the Kanban view and multiple orders.",
      },
      {
        scene: 2,
        voiceoverEN: "Click 'Start Preparing' to acknowledge the order, then 'Ready for Delivery' when it's done, and 'Confirm Delivery' once it reaches the customer.",
        voiceoverAR: "اضغط 'ابدأ التحضير' لاستلام الطلب، ثم 'جاهز للتسليم' عند الانتهاء، ثم 'تأكيد التسليم' عند وصوله للعميل.",
        screenAction: "Move an order through all three stages in the Kanban.",
      },
      {
        scene: 3,
        voiceoverEN: "For returns, open the delivered order details, click Request Return, and submit for manager approval.",
        voiceoverAR: "للمرتجعات، افتح تفاصيل الطلب المسلَّم، اضغط 'طلب إرجاع'، وأرسل للموافقة من المدير.",
        screenAction: "Open order drawer, click Request Return, fill in reason, submit.",
      },
    ],
  },

  {
    id: "kds",
    nameEN: "KDS — Kitchen Display",
    nameAR: "شاشة المطبخ",
    descriptionEN: "Kitchen staff see and manage incoming orders on a dedicated full-screen display.",
    descriptionAR: "يرى موظفو المطبخ الطلبات الواردة ويديرونها على شاشة كاملة مخصصة.",
    roles: ["owner", "manager", "buffet_worker"],
    guideEN: {
      overview:
        "The Kitchen Display System (KDS) is a full-screen view designed for kitchen staff. Orders appear as cards sorted by arrival time. Older orders pulse red to signal urgency. Staff move orders from Preparing to Ready directly from this screen.",
      steps: [
        "Navigate to 'Kitchen Display' from the sidebar — it opens in full-screen mode.",
        "View incoming order cards with order number, room, items, and elapsed time.",
        "Orders older than the urgency threshold flash red.",
        "Click 'Start Preparing' on a new order card to acknowledge it.",
        "Click 'Ready for Delivery' when the order is complete.",
        "The order disappears from the KDS and appears as Ready in the Orders page.",
      ],
      buttons: [
        "Start Preparing — acknowledges the order and moves it to Preparing.",
        "Ready for Delivery — marks the order as ready, alerting cashiers.",
      ],
      fields: [
        "Urgency timer (set in Settings) — threshold in minutes after which orders flash red.",
        "Order category label (if assigned) — shows which station should prepare it.",
      ],
      bestPractices: [
        "Mount the KDS display in the kitchen where all staff can see it.",
        "Set the urgency timer to match your kitchen's realistic prep time.",
        "Acknowledge orders immediately by clicking Start Preparing to show the customer their order is in progress.",
        "Use the order category label to route orders to the correct prep station.",
      ],
      commonMistakes: [
        "Not acknowledging orders promptly — customers think their order was missed.",
        "Clicking 'Ready for Delivery' before the food is actually ready.",
        "Leaving the KDS on low brightness in a bright kitchen — hard to read.",
      ],
    },
    guideAR: {
      overview:
        "شاشة المطبخ هي عرض ملء الشاشة مصمم لموظفي المطبخ. تظهر الطلبات كبطاقات مرتبة بوقت الوصول. الطلبات القديمة تومض باللون الأحمر للإشارة إلى الإلحاح. يحرّك الموظفون الطلبات من التحضير إلى الجاهز مباشرةً من هذه الشاشة.",
      steps: [
        "انتقل إلى 'شاشة المطبخ' من الشريط الجانبي — تفتح في وضع ملء الشاشة.",
        "اعرض بطاقات الطلبات الواردة مع رقم الطلب والغرفة والعناصر والوقت المنقضي.",
        "الطلبات الأقدم من عتبة الإلحاح تومض باللون الأحمر.",
        "اضغط 'ابدأ التحضير' على بطاقة طلب جديد لاستلامه.",
        "اضغط 'جاهز للتسليم' عند اكتمال الطلب.",
        "يختفي الطلب من شاشة المطبخ ويظهر كجاهز في صفحة الطلبات.",
      ],
      buttons: [
        "ابدأ التحضير — يستلم الطلب وينقله إلى قيد التحضير.",
        "جاهز للتسليم — يمييز الطلب كجاهز، منبّهاً الكاشيرين.",
      ],
      fields: [
        "مؤقت الإلحاح (يُضبط في الإعدادات) — الحد بالدقائق الذي بعده تومض الطلبات باللون الأحمر.",
        "تسمية فئة الطلب (إذا كانت مُخصصة) — تُظهر أي محطة يجب أن تحضره.",
      ],
      bestPractices: [
        "ركّب شاشة المطبخ في مكان يراها جميع الموظفين.",
        "اضبط مؤقت الإلحاح ليتوافق مع وقت التحضير الواقعي في مطبخك.",
        "استلم الطلبات فوراً بالضغط على 'ابدأ التحضير' لإعلام العميل بأن طلبه قيد التنفيذ.",
        "استخدم تسمية فئة الطلب لتوجيه الطلبات إلى محطة التحضير الصحيحة.",
      ],
      commonMistakes: [
        "عدم استلام الطلبات بسرعة — يظن العملاء أن طلبهم لم يُستلَم.",
        "الضغط على 'جاهز للتسليم' قبل أن يكون الطعام جاهزاً فعلاً.",
        "ترك شاشة المطبخ على سطوع منخفض في مطبخ مضيء — يصعب قراءتها.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "The Kitchen Display shows all incoming orders for your kitchen staff in a clear, full-screen view.",
        voiceoverAR: "شاشة المطبخ تعرض جميع الطلبات الواردة لموظفي المطبخ في عرض واضح بملء الشاشة.",
        screenAction: "Show the KDS full-screen with multiple order cards.",
      },
      {
        scene: 2,
        voiceoverEN: "Orders pulse red when they've been waiting too long — your kitchen knows what needs attention immediately.",
        voiceoverAR: "الطلبات تومض باللون الأحمر عند الانتظار طويلاً — يعرف مطبخك ما يحتاج انتباهاً فوراً.",
        screenAction: "Highlight a red-pulsing order card.",
      },
      {
        scene: 3,
        voiceoverEN: "Tap 'Start Preparing' to acknowledge, then 'Ready for Delivery' when done. The order automatically notifies cashiers.",
        voiceoverAR: "اضغط 'ابدأ التحضير' للاستلام، ثم 'جاهز للتسليم' عند الانتهاء. الطلب ينبّه الكاشيرين تلقائياً.",
        screenAction: "Click Start Preparing on one card, then Ready for Delivery.",
      },
    ],
  },

  {
    id: "qr-ordering",
    nameEN: "QR Ordering",
    nameAR: "الطلب عبر QR",
    descriptionEN: "Customer-facing QR menu for self-ordering from gaming rooms.",
    descriptionAR: "منيو QR للعملاء لطلب الطعام ذاتياً من غرف اللعب.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "The QR Ordering system lets customers scan a QR code placed on their gaming table, browse the menu, and place orders directly — all without involving a cashier. Orders go straight to the kitchen display.",
      steps: [
        "Ensure each room has a QR code generated (see Assets module).",
        "Print and laminate the QR card for each room.",
        "Customer scans the QR code with their phone camera.",
        "The public menu page opens — they browse categories and add items.",
        "They tap 'Place Order' to submit — no login required.",
        "The order appears instantly in the Kitchen Display and Orders page.",
        "Staff confirm delivery through the Orders module.",
      ],
      buttons: [
        "Generate QR (in Assets) — creates the unique QR link for this room.",
        "Regenerate QR — invalidates old link if security is a concern.",
        "Print QR — prints the QR card for physical placement.",
        "Place Order (customer-side) — submits the order from the customer's phone.",
      ],
      fields: [
        "No fields to configure on the QR menu — content comes from the Products and Categories modules.",
      ],
      bestPractices: [
        "Laminate QR codes to prevent damage from food and drink spills.",
        "Ensure all menu items have accurate names, prices, and availability toggled correctly.",
        "Test the QR link on multiple devices before your opening day.",
        "Set items to 'unavailable' rather than deleting them when out of stock temporarily.",
      ],
      commonMistakes: [
        "Not printing QR codes for new rooms added after opening.",
        "Leaving old unlaminated QR codes on tables after regenerating — customers will get a broken link.",
        "Not updating the menu before opening — customers see old prices or unavailable items.",
      ],
    },
    guideAR: {
      overview:
        "نظام الطلب عبر QR يتيح للعملاء مسح رمز QR موضوع على طاولة الألعاب، تصفح المنيو، وتقديم الطلبات مباشرةً — دون إشراك أي كاشير. تذهب الطلبات مباشرةً إلى شاشة المطبخ.",
      steps: [
        "تأكد من أن كل غرفة لها رمز QR مُولَّد (راجع وحدة الأصول).",
        "اطبع بطاقة QR وغلّفها بالبلاستيك لكل غرفة.",
        "يمسح العميل رمز QR بكاميرا هاتفه.",
        "تفتح صفحة المنيو العامة — يتصفح الفئات ويضيف عناصر.",
        "يضغط 'تقديم الطلب' لإرساله — لا يلزم تسجيل دخول.",
        "يظهر الطلب فوراً في شاشة المطبخ وصفحة الطلبات.",
        "يؤكد الموظفون التسليم من خلال وحدة الطلبات.",
      ],
      buttons: [
        "إنشاء QR (في الأصول) — ينشئ رابط QR الفريد لهذه الغرفة.",
        "تجديد QR — يُبطل الرابط القديم إذا كان الأمان مثاراً للقلق.",
        "طباعة QR — يطبع بطاقة QR للوضع المادي.",
        "تقديم الطلب (جانب العميل) — يرسل الطلب من هاتف العميل.",
      ],
      fields: [
        "لا توجد حقول للتهيئة في منيو QR — المحتوى يأتي من وحدتي المنتجات والفئات.",
      ],
      bestPractices: [
        "غلّف رموز QR بالبلاستيك لمنع التلف من تسرب الطعام والشراب.",
        "تأكد من أن جميع عناصر المنيو لها أسماء وأسعار دقيقة وتبديل التوافر صحيح.",
        "اختبر رابط QR على أجهزة متعددة قبل يوم الافتتاح.",
        "اضبط العناصر على 'غير متاح' بدلاً من حذفها عند نفاد المخزون مؤقتاً.",
      ],
      commonMistakes: [
        "عدم طباعة رموز QR للغرف الجديدة المضافة بعد الافتتاح.",
        "ترك رموز QR القديمة غير المغلفة على الطاولات بعد التجديد — سيحصل العملاء على رابط معطل.",
        "عدم تحديث المنيو قبل الفتح — يرى العملاء أسعاراً قديمة أو عناصر غير متاحة.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "QR Ordering lets customers place food and drink orders themselves — no cashier needed.",
        voiceoverAR: "الطلب عبر QR يتيح للعملاء طلب الطعام والمشروبات بأنفسهم — دون الحاجة لكاشير.",
        screenAction: "Show the QR code on a physical table being scanned by a phone.",
      },
      {
        scene: 2,
        voiceoverEN: "They see your menu instantly on their phone, add items, and tap Place Order.",
        voiceoverAR: "يرون منيوك فوراً على هواتفهم، يضيفون عناصر، ويضغطون 'تقديم الطلب'.",
        screenAction: "Show the public QR menu page on a mobile screen, adding items.",
      },
      {
        scene: 3,
        voiceoverEN: "The order immediately appears in your kitchen display and orders list — zero delay.",
        voiceoverAR: "يظهر الطلب فوراً في شاشة المطبخ وقائمة الطلبات — بدون أي تأخير.",
        screenAction: "Show KDS screen refreshing with a new order card appearing.",
      },
    ],
  },

  {
    id: "payments",
    nameEN: "Payments",
    nameAR: "المدفوعات",
    descriptionEN: "View and confirm all payment transactions from sessions and orders.",
    descriptionAR: "عرض وتأكيد جميع معاملات الدفع من الجلسات والطلبات.",
    roles: ["owner", "manager", "cashier"],
    guideEN: {
      overview:
        "The Payments module shows all financial transactions in the system — both from session closings and from POS/QR orders. Cashiers can confirm pending payments; managers can review the full ledger.",
      steps: [
        "Navigate to 'Payments' from the sidebar.",
        "View the list of all payment transactions with status (Confirmed / Pending).",
        "Filter by date range, payment method, or status.",
        "Click a transaction to see its details — session or order it belongs to.",
        "For pending payments (InstaPay/Visa), click 'Confirm' once the transfer is verified.",
        "Export the payments ledger for accounting purposes.",
      ],
      buttons: [
        "Confirm — marks a pending payment as confirmed after manual verification.",
        "View Details — opens the linked session or order record.",
        "Filter controls — filter by date, method, or status.",
      ],
      fields: [
        "Payment Method — Cash, InstaPay, or Visa.",
        "Status — Confirmed or Pending.",
        "Amount — total collected for the transaction.",
        "Date & Time — when the payment was recorded.",
        "Source — the session or order associated with the payment.",
      ],
      bestPractices: [
        "Confirm InstaPay and Visa payments as soon as the transfer notification arrives.",
        "Reconcile the Payments ledger against your physical cash at the end of each shift.",
        "Use the method filter to separately review cash vs. digital payments for reconciliation.",
      ],
      commonMistakes: [
        "Leaving InstaPay payments in 'Pending' status without confirming — shifts will show incorrect totals.",
        "Not reviewing the payments ledger regularly — discrepancies grow harder to trace over time.",
      ],
    },
    guideAR: {
      overview:
        "وحدة المدفوعات تعرض جميع المعاملات المالية في النظام — من إغلاق الجلسات ومن طلبات POS/QR. يستطيع الكاشيرون تأكيد المدفوعات المعلقة؛ يستطيع المديرون مراجعة السجل الكامل.",
      steps: [
        "انتقل إلى 'المدفوعات' من الشريط الجانبي.",
        "اعرض قائمة جميع معاملات الدفع مع الحالة (مؤكد / معلق).",
        "صفّ حسب نطاق التاريخ أو طريقة الدفع أو الحالة.",
        "اضغط معاملة لعرض تفاصيلها — الجلسة أو الطلب المرتبط بها.",
        "للمدفوعات المعلقة (إنستاباي/فيزا)، اضغط 'تأكيد' بعد التحقق من التحويل.",
        "صدّر سجل المدفوعات لأغراض المحاسبة.",
      ],
      buttons: [
        "تأكيد — يمييز دفعة معلقة كمؤكدة بعد التحقق اليدوي.",
        "عرض التفاصيل — يفتح سجل الجلسة أو الطلب المرتبط.",
        "أدوات التصفية — تصفية حسب التاريخ أو الطريقة أو الحالة.",
      ],
      fields: [
        "طريقة الدفع — نقداً أو إنستاباي أو فيزا.",
        "الحالة — مؤكد أو معلق.",
        "المبلغ — الإجمالي المحصّل للمعاملة.",
        "التاريخ والوقت — متى سُجّل الدفع.",
        "المصدر — الجلسة أو الطلب المرتبط بالدفع.",
      ],
      bestPractices: [
        "أكّد مدفوعات إنستاباي وفيزا فور وصول إشعار التحويل.",
        "قارن سجل المدفوعات بالكاش المادي في نهاية كل وردية.",
        "استخدم فلتر الطريقة لمراجعة الكاش والمدفوعات الرقمية بشكل منفصل عند التسوية.",
      ],
      commonMistakes: [
        "ترك مدفوعات إنستاباي في حالة 'معلق' دون تأكيد — ستُظهر الورديات إجماليات غير صحيحة.",
        "عدم مراجعة سجل المدفوعات بانتظام — تصعب متابعة التناقضات مع مرور الوقت.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "The Payments page is your financial ledger — every transaction from sessions and orders appears here.",
        voiceoverAR: "صفحة المدفوعات هي سجلك المالي — كل معاملة من الجلسات والطلبات تظهر هنا.",
        screenAction: "Show the Payments list with mixed confirmed and pending entries.",
      },
      {
        scene: 2,
        voiceoverEN: "InstaPay and Visa payments start as Pending. Once you verify the transfer, click Confirm to close them.",
        voiceoverAR: "مدفوعات إنستاباي وفيزا تبدأ كمعلقة. بعد التحقق من التحويل، اضغط 'تأكيد' لإغلاقها.",
        screenAction: "Find a Pending payment, click Confirm, show status changing to Confirmed.",
      },
    ],
  },

  {
    id: "products",
    nameEN: "Products",
    nameAR: "المنتجات",
    descriptionEN: "Add, edit, and manage menu items with pricing and availability.",
    descriptionAR: "إضافة وتعديل وإدارة عناصر المنيو مع الأسعار وحالة التوافر.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "The Products section (within the Menu module) is where you manage all items available for ordering — both in the QR menu and the POS. Each product has a name (Arabic and English), a price, a category, and an availability toggle.",
      steps: [
        "Navigate to 'Menu' from the sidebar.",
        "View all existing products grouped by category.",
        "Click 'Add Product' to create a new item.",
        "Fill in the Arabic name (required), English name (optional), price, and category.",
        "Toggle 'Available' to control whether the item appears in the QR menu.",
        "Click Save — the product is immediately visible in POS and QR menu.",
        "To edit, click the pencil icon on a product card.",
        "To delete, click the trash icon — only possible if the product isn't linked to active orders or recipes.",
      ],
      buttons: [
        "Add Product — opens the create product form.",
        "Edit (pencil icon) — opens the edit form for an existing product.",
        "Delete (trash icon) — removes the product if it has no active dependencies.",
        "Availability toggle — enables or disables the product in the QR menu.",
      ],
      fields: [
        "Arabic Name (required) — shown to customers on the QR menu.",
        "English Name (optional) — shown in POS and internally.",
        "Price (EGP) — what customers pay per unit.",
        "Category — links the product to a menu category for filtering.",
        "Available toggle — controls QR menu visibility.",
      ],
      bestPractices: [
        "Keep Arabic names short and clear — they appear on kitchen tickets.",
        "Always assign a category so products are findable in POS and the QR menu.",
        "Use the availability toggle instead of deleting products when they're temporarily out of stock.",
        "Review prices seasonally and update in bulk before your peak seasons.",
      ],
      commonMistakes: [
        "Setting price to 0 — orders will show as free on bills.",
        "Forgetting to assign a category — the product won't appear under any filter tab.",
        "Deleting a product still linked to a recipe — the system will block this.",
      ],
    },
    guideAR: {
      overview:
        "قسم المنتجات (ضمن وحدة المنيو) هو المكان الذي تدير فيه جميع العناصر المتاحة للطلب — في منيو QR ونقطة البيع. لكل منتج اسم (عربي وإنجليزي) وسعر وفئة وزر تبديل التوافر.",
      steps: [
        "انتقل إلى 'المنيو' من الشريط الجانبي.",
        "اعرض جميع المنتجات الموجودة مجمّعةً حسب الفئة.",
        "اضغط 'إضافة منتج' لإنشاء عنصر جديد.",
        "أدخل الاسم بالعربية (مطلوب)، الاسم بالإنجليزية (اختياري)، السعر، والفئة.",
        "فعّل 'متاح' للتحكم في ظهور العنصر في منيو QR.",
        "اضغط حفظ — يظهر المنتج فوراً في نقطة البيع ومنيو QR.",
        "للتعديل، اضغط أيقونة القلم على بطاقة المنتج.",
        "للحذف، اضغط أيقونة سلة المهملات — ممكن فقط إذا لم يكن المنتج مرتبطاً بطلبات أو وصفات نشطة.",
      ],
      buttons: [
        "إضافة منتج — يفتح نموذج إنشاء منتج.",
        "تعديل (أيقونة القلم) — يفتح نموذج التعديل لمنتج موجود.",
        "حذف (أيقونة سلة المهملات) — يزيل المنتج إذا لم تكن له تبعيات نشطة.",
        "زر تبديل التوافر — يُفعّل أو يُعطّل المنتج في منيو QR.",
      ],
      fields: [
        "الاسم بالعربية (مطلوب) — يُعرض للعملاء في منيو QR.",
        "الاسم بالإنجليزية (اختياري) — يُعرض في نقطة البيع وداخلياً.",
        "السعر (ج.م) — ما يدفعه العملاء لكل وحدة.",
        "الفئة — تربط المنتج بفئة المنيو للتصفية.",
        "زر تبديل التوافر — يتحكم في ظهور منيو QR.",
      ],
      bestPractices: [
        "حافظ على الأسماء العربية قصيرة وواضحة — تظهر على تذاكر المطبخ.",
        "خصّص فئة دائماً حتى يمكن إيجاد المنتجات في نقطة البيع ومنيو QR.",
        "استخدم زر التوافر بدلاً من حذف المنتجات عند نفاد مخزونها مؤقتاً.",
        "راجع الأسعار موسمياً وحدّثها قبل مواسم الذروة.",
      ],
      commonMistakes: [
        "ضبط السعر على صفر — ستظهر الطلبات كمجانية في الفواتير.",
        "نسيان تخصيص فئة — لن يظهر المنتج تحت أي تبويب تصفية.",
        "حذف منتج لا يزال مرتبطاً بوصفة — سيمنع النظام ذلك.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Products are everything your customers can order. Let's add one and see it appear instantly in the POS and QR menu.",
        voiceoverAR: "المنتجات هي كل ما يمكن لعملائك طلبه. دعنا نضيف منتجاً ونراه يظهر فوراً في نقطة البيع ومنيو QR.",
        screenAction: "Show the Menu page with existing products.",
      },
      {
        scene: 2,
        voiceoverEN: "Click Add Product, fill in the Arabic name, set a price, pick a category, and save.",
        voiceoverAR: "اضغط 'إضافة منتج'، أدخل الاسم بالعربية، حدّد سعراً، اختر فئة، واحفظ.",
        screenAction: "Open Add Product dialog, fill fields, click Save. Product appears in grid.",
      },
      {
        scene: 3,
        voiceoverEN: "Toggle availability off to hide it temporarily — perfect for sold-out items without deleting them.",
        voiceoverAR: "أوقف التوافر لإخفاء المنتج مؤقتاً — مثالي للعناصر المنتهية دون حذفها.",
        screenAction: "Toggle the availability switch on a product card. Show it disappearing from QR menu preview.",
      },
    ],
  },

  {
    id: "categories",
    nameEN: "Categories",
    nameAR: "الفئات",
    descriptionEN: "Organize menu items into categories for easy navigation.",
    descriptionAR: "تنظيم عناصر المنيو في فئات لسهولة التنقل.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "Categories group your products for navigation in both the POS and QR menu. Examples: Beverages, Hot Food, Snacks. Well-organized categories speed up ordering for cashiers and customers alike.",
      steps: [
        "Navigate to 'Menu' from the sidebar.",
        "Click 'Manage Categories' to open the category manager.",
        "Click 'Add Category' to create a new group.",
        "Enter the Arabic name and optional English name.",
        "Click Save — the category is immediately available when adding products.",
        "To edit, click the edit icon next to a category.",
        "To delete, click delete — only allowed if the category has no products.",
      ],
      buttons: [
        "Manage Categories — opens the category management panel.",
        "Add Category — creates a new category.",
        "Edit icon — opens the edit form for an existing category.",
        "Delete icon — removes the category if it has no products.",
      ],
      fields: [
        "Arabic Name (required) — shown as tabs in POS and QR menu.",
        "English Name (optional) — shown alongside for bilingual use.",
      ],
      bestPractices: [
        "Limit categories to 6–8 for easy navigation.",
        "Order categories by popularity — put the most ordered at the top.",
        "Use clear, single-word category names (Drinks, Snacks, Hot Food) for fast scanning.",
        "Never delete a category without first moving or deleting its products.",
      ],
      commonMistakes: [
        "Creating too many narrow categories — makes the menu hard to navigate.",
        "Deleting a category that still has products — the system blocks this, move products first.",
        "Using English-only names in an Arabic-primary venue.",
      ],
    },
    guideAR: {
      overview:
        "الفئات تجمع منتجاتك للتنقل في كل من نقطة البيع ومنيو QR. أمثلة: مشروبات، طعام ساخن، وجبات خفيفة. الفئات المنظمة جيداً تسرّع الطلب للكاشيرين والعملاء.",
      steps: [
        "انتقل إلى 'المنيو' من الشريط الجانبي.",
        "اضغط 'إدارة الفئات' لفتح مدير الفئات.",
        "اضغط 'إضافة فئة' لإنشاء مجموعة جديدة.",
        "أدخل الاسم بالعربية والاسم الاختياري بالإنجليزية.",
        "اضغط حفظ — تصبح الفئة متاحة فوراً عند إضافة المنتجات.",
        "للتعديل، اضغط أيقونة التعديل بجانب فئة.",
        "للحذف، اضغط حذف — مسموح فقط إذا لم تكن للفئة منتجات.",
      ],
      buttons: [
        "إدارة الفئات — يفتح لوحة إدارة الفئات.",
        "إضافة فئة — ينشئ فئة جديدة.",
        "أيقونة التعديل — تفتح نموذج التعديل لفئة موجودة.",
        "أيقونة الحذف — تزيل الفئة إذا لم تكن بها منتجات.",
      ],
      fields: [
        "الاسم بالعربية (مطلوب) — يظهر كتبويبات في نقطة البيع ومنيو QR.",
        "الاسم بالإنجليزية (اختياري) — يُعرض جانباً للاستخدام ثنائي اللغة.",
      ],
      bestPractices: [
        "اقتصر على 6–8 فئات لسهولة التنقل.",
        "رتّب الفئات حسب الشعبية — ضع الأكثر طلباً في الأعلى.",
        "استخدم أسماء فئات واضحة بكلمة واحدة (مشروبات، وجبات خفيفة، طعام ساخن) لمسح سريع.",
        "لا تحذف فئة دون نقل منتجاتها أو حذفها أولاً.",
      ],
      commonMistakes: [
        "إنشاء فئات ضيقة للغاية — يجعل المنيو صعب التنقل.",
        "حذف فئة لا تزال بها منتجات — يمنع النظام ذلك، انقل المنتجات أولاً.",
        "استخدام أسماء إنجليزية فقط في مكان عربي في المقام الأول.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Categories keep your menu organized. Let's create one and assign products to it.",
        voiceoverAR: "الفئات تحافظ على تنظيم منيوك. دعنا ننشئ واحدة ونخصص لها منتجات.",
        screenAction: "Open Manage Categories panel.",
      },
      {
        scene: 2,
        voiceoverEN: "Click Add Category, enter the name in Arabic and English, and save. It's immediately available.",
        voiceoverAR: "اضغط 'إضافة فئة'، أدخل الاسم بالعربية والإنجليزية، واحفظ. تصبح متاحة فوراً.",
        screenAction: "Add Category dialog, fill fields, save. Category appears in the list.",
      },
    ],
  },

  {
    id: "inventory",
    nameEN: "Inventory",
    nameAR: "المخزون",
    descriptionEN: "Track stock levels for ingredients and supplies with automatic deduction via recipes.",
    descriptionAR: "تتبع مستويات المخزون للمكونات والمستلزمات مع الخصم التلقائي عبر الوصفات.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "Inventory tracks raw materials and supplies (e.g., Pepsi cans, bread, coffee beans). Stock levels are deducted automatically when products linked to recipes are delivered. Low-stock alerts appear on the Dashboard.",
      steps: [
        "Navigate to 'Inventory' from the sidebar.",
        "Click 'Add Item' to create a new inventory item.",
        "Fill in the Arabic name, English name, unit, current stock, and minimum level.",
        "Click Save — the item appears in the list.",
        "To manually adjust stock, click the 'Movement' button on an item.",
        "Choose movement type: Add Stock (Purchase), Sale (Deduct), Waste, or Manual Adjustment.",
        "Enter the quantity and an optional reason, then confirm.",
        "Filter by 'Low Stock Only' to see items that need restocking.",
      ],
      buttons: [
        "Add Item — creates a new inventory item.",
        "Movement — opens the stock movement dialog for manual adjustments.",
        "Low Stock Only toggle — filters the list to show only items below minimum.",
        "Edit icon — modifies item name, unit, or thresholds.",
        "Delete icon — removes the item if not linked to recipes.",
      ],
      fields: [
        "Arabic Name (required) — how the item is identified.",
        "English Name (required) — used in bilingual contexts.",
        "Unit — e.g., can, kg, liter, piece.",
        "Current Stock — the quantity on hand.",
        "Minimum Level — triggers low-stock alerts on the Dashboard.",
        "Movement Type — Purchase, Sale, Waste, or Manual Adjustment.",
        "Quantity — units to add or deduct.",
        "Reason / Note — optional text for audit trail.",
      ],
      bestPractices: [
        "Set realistic minimum levels — high enough to give you time to reorder.",
        "Record all stock in and out through the system for accurate counts.",
        "Do a physical stock count weekly and reconcile with system counts.",
        "Use Waste movements to track spoilage and calculate true food cost.",
      ],
      commonMistakes: [
        "Not setting minimum levels — low-stock alerts won't trigger.",
        "Skipping waste entries — makes food cost tracking inaccurate.",
        "Forgetting to create inventory items before adding recipes — recipes need items to exist first.",
      ],
    },
    guideAR: {
      overview:
        "يتتبع المخزون المواد الخام والمستلزمات (مثل علب بيبسي، خبز، حبوب قهوة). تُخصَم مستويات المخزون تلقائياً عند تسليم المنتجات المرتبطة بوصفات. تظهر تنبيهات انخفاض المخزون على اللوحة الرئيسية.",
      steps: [
        "انتقل إلى 'المخزون' من الشريط الجانبي.",
        "اضغط 'إضافة عنصر' لإنشاء عنصر مخزون جديد.",
        "أدخل الاسم بالعربية والإنجليزية والوحدة والمخزون الحالي والحد الأدنى.",
        "اضغط حفظ — يظهر العنصر في القائمة.",
        "لضبط المخزون يدوياً، اضغط 'حركة' على عنصر.",
        "اختر نوع الحركة: إضافة مخزون (شراء)، بيع (خصم)، هدر، أو ضبط يدوي.",
        "أدخل الكمية وسبباً اختيارياً، ثم أكّد.",
        "صفّ بـ'انخفاض المخزون فقط' لرؤية العناصر التي تحتاج إعادة تخزين.",
      ],
      buttons: [
        "إضافة عنصر — ينشئ عنصر مخزون جديد.",
        "حركة — يفتح نافذة حركة المخزون للتعديلات اليدوية.",
        "تبديل 'انخفاض المخزون فقط' — يُصفّي القائمة لعرض العناصر دون الحد الأدنى فقط.",
        "أيقونة التعديل — تعدّل الاسم أو الوحدة أو الحدود.",
        "أيقونة الحذف — تزيل العنصر إذا لم يكن مرتبطاً بوصفات.",
      ],
      fields: [
        "الاسم بالعربية (مطلوب) — كيفية تعريف العنصر.",
        "الاسم بالإنجليزية (مطلوب) — يُستخدم في السياقات ثنائية اللغة.",
        "الوحدة — مثل علبة، كجم، لتر، قطعة.",
        "المخزون الحالي — الكمية المتوفرة.",
        "الحد الأدنى — يُفعّل تنبيهات انخفاض المخزون على اللوحة الرئيسية.",
        "نوع الحركة — شراء، بيع، هدر، أو ضبط يدوي.",
        "الكمية — الوحدات المراد إضافتها أو خصمها.",
        "السبب / الملاحظة — نص اختياري لمسار المراجعة.",
      ],
      bestPractices: [
        "اضبط حدوداً دنيا واقعية — عالية بما يكفي لإعطائك وقتاً لإعادة الطلب.",
        "سجّل جميع الدخول والخروج من المخزون عبر النظام لحسابات دقيقة.",
        "أجرِ جرداً مادياً أسبوعياً وقارنه بأرقام النظام.",
        "استخدم حركات الهدر لتتبع التلف وحساب تكلفة الطعام الحقيقية.",
      ],
      commonMistakes: [
        "عدم ضبط الحدود الدنيا — لن تُفعَّل تنبيهات انخفاض المخزون.",
        "تخطي إدخالات الهدر — يجعل تتبع تكلفة الطعام غير دقيق.",
        "نسيان إنشاء عناصر مخزون قبل إضافة الوصفات — الوصفات تحتاج وجود العناصر أولاً.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Inventory lets you track every ingredient and supply in your venue — with automatic deduction when orders are delivered.",
        voiceoverAR: "المخزون يتيح تتبع كل مكوّن ومستلزم في مركزك — مع الخصم التلقائي عند تسليم الطلبات.",
        screenAction: "Show the Inventory list with stock levels and low-stock badges.",
      },
      {
        scene: 2,
        voiceoverEN: "Click Movement to record purchases, sales, or waste manually — keeping your counts accurate at all times.",
        voiceoverAR: "اضغط 'حركة' لتسجيل المشتريات أو المبيعات أو الهدر يدوياً — لإبقاء حساباتك دقيقة دائماً.",
        screenAction: "Open Movement dialog, select Add Stock (Purchase), enter quantity, confirm.",
      },
      {
        scene: 3,
        voiceoverEN: "Turn on 'Low Stock Only' to instantly see everything that needs restocking today.",
        voiceoverAR: "فعّل 'انخفاض المخزون فقط' لرؤية كل ما يحتاج إعادة تخزين اليوم.",
        screenAction: "Toggle Low Stock Only filter. List reduces to only items below minimum.",
      },
    ],
  },

  {
    id: "expenses",
    nameEN: "Expenses",
    nameAR: "المصروفات",
    descriptionEN: "Record and categorize business expenses to track true profitability.",
    descriptionAR: "تسجيل وتصنيف مصروفات الأعمال لتتبع الربحية الحقيقية.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "The Expenses module (under Finance) lets you log all business costs — rent, salaries, utilities, supplies — to give you an accurate profit and loss picture. Expenses are categorized and linked to payment accounts.",
      steps: [
        "Navigate to 'Finance > Expenses'.",
        "Click 'Add Expense'.",
        "Select the expense category (Rent, Salary, Utilities, etc.).",
        "Enter the amount, date, payment account, vendor, and optional notes.",
        "Set status: Paid, Pending, or Partial.",
        "Click Save — the expense is recorded.",
        "To mark a pending expense as paid, find it in the list and click 'Mark Paid'.",
        "To delete, click Delete and confirm.",
      ],
      buttons: [
        "Add Expense — opens the expense creation form.",
        "Mark Paid — changes a Pending expense to Paid status.",
        "Delete — removes the expense record.",
        "Filter controls — filter by date range, category, or status.",
      ],
      fields: [
        "Category — the type of expense (Rent, Salary, Utilities, Supplies, etc.).",
        "Amount (EGP) — the total cost of the expense.",
        "Date — when the expense occurred or is due.",
        "Payment Account — which cash/bank account this was paid from.",
        "Status — Paid, Pending, or Partial.",
        "Vendor / Provider — who you're paying.",
        "Notes — any additional context.",
      ],
      bestPractices: [
        "Record expenses as they occur, not in bulk at month-end.",
        "Use consistent categories so reports are meaningful.",
        "Link expenses to the correct payment account for accurate cash flow.",
        "Review pending expenses at the end of each week to avoid surprises.",
      ],
      commonMistakes: [
        "Leaving recurring expenses (rent, salary) as Pending for weeks — distorts the profit calculation.",
        "Not assigning a category — makes expenses impossible to analyze by type.",
        "Entering expenses in the wrong account — cash flow reports will be misleading.",
      ],
    },
    guideAR: {
      overview:
        "وحدة المصروفات (ضمن المالية) تتيح تسجيل جميع تكاليف الأعمال — إيجار، رواتب، مرافق، مستلزمات — لمنحك صورة دقيقة عن الأرباح والخسائر. تُصنَّف المصروفات وتُربط بحسابات الدفع.",
      steps: [
        "انتقل إلى 'المالية > المصروفات'.",
        "اضغط 'إضافة مصروف'.",
        "اختر فئة المصروف (إيجار، راتب، مرافق، إلخ).",
        "أدخل المبلغ والتاريخ وحساب الدفع والمورد والملاحظات الاختيارية.",
        "اضبط الحالة: مدفوع أو معلق أو جزئي.",
        "اضغط حفظ — يُسجَّل المصروف.",
        "لتمييز مصروف معلق كمدفوع، ابحث عنه في القائمة واضغط 'تحديد كمدفوع'.",
        "للحذف، اضغط 'حذف' وأكّد.",
      ],
      buttons: [
        "إضافة مصروف — يفتح نموذج إنشاء المصروف.",
        "تحديد كمدفوع — يغيّر مصروفاً معلقاً إلى حالة 'مدفوع'.",
        "حذف — يزيل سجل المصروف.",
        "أدوات التصفية — تصفية حسب نطاق التاريخ أو الفئة أو الحالة.",
      ],
      fields: [
        "الفئة — نوع المصروف (إيجار، راتب، مرافق، مستلزمات، إلخ).",
        "المبلغ (ج.م) — التكلفة الإجمالية للمصروف.",
        "التاريخ — متى حدث المصروف أو موعد استحقاقه.",
        "حساب الدفع — أي حساب نقدي/بنكي دُفع منه.",
        "الحالة — مدفوع أو معلق أو جزئي.",
        "المورد / المزود — من تدفع له.",
        "ملاحظات — أي سياق إضافي.",
      ],
      bestPractices: [
        "سجّل المصروفات فور حدوثها، وليس بشكل مجمّع في نهاية الشهر.",
        "استخدم فئات متسقة حتى تكون التقارير ذات معنى.",
        "اربط المصروفات بحساب الدفع الصحيح لتدفق نقدي دقيق.",
        "راجع المصروفات المعلقة في نهاية كل أسبوع لتجنب المفاجآت.",
      ],
      commonMistakes: [
        "ترك المصروفات المتكررة (إيجار، رواتب) معلقةً لأسابيع — يشوّه حساب الأرباح.",
        "عدم تخصيص فئة — يجعل تحليل المصروفات حسب النوع مستحيلاً.",
        "إدخال المصروفات في الحساب الخاطئ — ستكون تقارير التدفق النقدي مضللة.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Tracking expenses is how you know your real profit. Let's log a new one in the Finance module.",
        voiceoverAR: "تتبع المصروفات هو الطريقة التي تعرف بها ربحك الحقيقي. دعنا نسجّل واحداً في وحدة المالية.",
        screenAction: "Navigate to Finance > Expenses page.",
      },
      {
        scene: 2,
        voiceoverEN: "Click Add Expense, pick the category, enter the amount and date, and set the status — Paid or Pending.",
        voiceoverAR: "اضغط 'إضافة مصروف'، اختر الفئة، أدخل المبلغ والتاريخ، وحدّد الحالة — مدفوع أو معلق.",
        screenAction: "Fill in the expense form: category Rent, amount, date, account, status Paid.",
      },
    ],
  },

  {
    id: "revenue",
    nameEN: "Revenue",
    nameAR: "الإيرادات",
    descriptionEN: "View all income from sessions, orders, and manual entries in the Finance module.",
    descriptionAR: "عرض جميع الإيرادات من الجلسات والطلبات والإدخالات اليدوية في وحدة المالية.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "Revenue (Money In) shows all income tracked in the system, broken down into gaming sessions, room orders, POS buffet sales, and any manually entered income. This gives you a complete picture of what money entered the business.",
      steps: [
        "Navigate to 'Finance > Money In'.",
        "View the breakdown by source: Session Revenue, Room Orders, Buffet/POS, Manual Income.",
        "Use the date range picker to filter the period.",
        "To add manual income (e.g., event fees not tracked elsewhere), click 'Add Manual Income'.",
        "Enter the amount, date, account, and description.",
        "Click Save — the income is added to the revenue totals.",
      ],
      buttons: [
        "Add Manual Income — records income not captured by sessions or orders.",
        "Date range picker — filters all revenue by period.",
        "Export — downloads the revenue data for external reporting.",
      ],
      fields: [
        "Income Source — sessions, room orders, buffet/POS, or manual.",
        "Amount (EGP) — the income amount.",
        "Date — when the income was received.",
        "Account — which account received the funds.",
        "Description — context for manual income entries.",
      ],
      bestPractices: [
        "Review revenue daily to spot any unexpected drops.",
        "Use manual income for one-off events, private bookings paid outside the system, or other non-standard revenue.",
        "Cross-reference revenue against the Payments ledger for accuracy.",
      ],
      commonMistakes: [
        "Forgetting to add manual income for off-system transactions — revenue totals will be understated.",
        "Looking at revenue alone without comparing to expenses — hides whether the business is profitable.",
      ],
    },
    guideAR: {
      overview:
        "الإيرادات (الأموال الداخلة) تعرض جميع الدخل المتتبَّع في النظام، مقسَّمةً إلى جلسات الألعاب وطلبات الغرف ومبيعات بوفيه POS وأي دخل مُدخَل يدوياً. يمنحك هذا صورة كاملة عن الأموال التي دخلت الأعمال.",
      steps: [
        "انتقل إلى 'المالية > الدخل'.",
        "اعرض التفصيل حسب المصدر: دخل الجلسات، طلبات الغرف، البوفيه/POS، الدخل اليدوي.",
        "استخدم محدد نطاق التاريخ لتصفية الفترة.",
        "لإضافة دخل يدوي (مثل رسوم فعاليات غير مسجلة في مكان آخر)، اضغط 'إضافة دخل يدوي'.",
        "أدخل المبلغ والتاريخ والحساب والوصف.",
        "اضغط حفظ — يُضاف الدخل إلى إجماليات الإيرادات.",
      ],
      buttons: [
        "إضافة دخل يدوي — يسجّل دخلاً غير ملتقط من الجلسات أو الطلبات.",
        "محدد نطاق التاريخ — يُصفّي جميع الإيرادات حسب الفترة.",
        "تصدير — يُنزّل بيانات الإيرادات لإعداد تقارير خارجية.",
      ],
      fields: [
        "مصدر الدخل — جلسات، طلبات غرف، بوفيه/POS، أو يدوي.",
        "المبلغ (ج.م) — مبلغ الدخل.",
        "التاريخ — متى استُلم الدخل.",
        "الحساب — أي حساب استلم الأموال.",
        "الوصف — سياق لمدخلات الدخل اليدوي.",
      ],
      bestPractices: [
        "راجع الإيرادات يومياً لاكتشاف أي انخفاضات غير متوقعة.",
        "استخدم الدخل اليدوي للفعاليات الفردية والحجوزات الخاصة المدفوعة خارج النظام.",
        "قارن الإيرادات بسجل المدفوعات للدقة.",
      ],
      commonMistakes: [
        "نسيان إضافة الدخل اليدوي للمعاملات خارج النظام — ستكون إجماليات الإيرادات أقل من الواقع.",
        "النظر في الإيرادات وحدها دون مقارنتها بالمصروفات — يُخفي ما إذا كانت الأعمال مربحة.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Revenue shows you all the money coming into your business — broken down by source so you know what's driving growth.",
        voiceoverAR: "الإيرادات تُريك كل الأموال الداخلة لأعمالك — مقسَّمةً حسب المصدر حتى تعرف ما يحرّك النمو.",
        screenAction: "Show Finance > Money In page with source breakdown cards.",
      },
      {
        scene: 2,
        voiceoverEN: "For income not captured by the system — like a private event fee — click Add Manual Income and record it.",
        voiceoverAR: "للدخل غير الملتقط بالنظام — كرسوم فعالية خاصة — اضغط 'إضافة دخل يدوي' وسجّله.",
        screenAction: "Click Add Manual Income, fill in fields, save.",
      },
    ],
  },

  {
    id: "shifts",
    nameEN: "Shifts",
    nameAR: "الورديات",
    descriptionEN: "Open, manage, and close staff shifts with cash reconciliation.",
    descriptionAR: "فتح وإدارة وإغلاق ورديات الموظفين مع تسوية الكاش.",
    roles: ["owner", "manager", "cashier"],
    guideEN: {
      overview:
        "Shifts frame all financial activity in the system. A shift must be open for sessions and payments to be recorded. At shift close, the system calculates expected cash and records any variance. Managers review shift reports for discrepancies.",
      steps: [
        "Navigate to 'Shifts' from the sidebar or click 'Open Shift' from the Dashboard.",
        "Click 'Open Shift' — enter the opening cash amount in the till.",
        "All sessions, payments, and orders are now tracked under this shift.",
        "To close the shift, click 'Close Shift'.",
        "Enter the actual cash counted in the till.",
        "The system shows the variance (expected vs. actual cash).",
        "Add any notes for the shift report and confirm closure.",
        "View past shift summaries in the Shifts history list.",
      ],
      buttons: [
        "Open Shift — starts a new shift with an opening cash amount.",
        "Close Shift — ends the shift and records cash reconciliation.",
        "View Shift Report — opens the detailed breakdown for a closed shift.",
      ],
      fields: [
        "Opening Cash — the amount of cash in the till at shift start.",
        "Closing Cash — the physical cash counted at shift end.",
        "Variance — automatically calculated: expected cash minus actual cash.",
        "Shift Notes — optional text for handover notes or explanations of discrepancies.",
      ],
      bestPractices: [
        "Count cash carefully before entering the opening and closing amounts.",
        "Close shifts at the end of each business day, not weekly.",
        "Use shift notes to explain any variance — even small ones.",
        "Review shift variance trends over time to spot recurring shortfalls.",
      ],
      commonMistakes: [
        "Operating without an open shift — no sessions or payments will be recorded.",
        "Entering the closing cash without physically counting — guessing creates false variances.",
        "Leaving a shift open overnight — the next day's activity gets mixed into yesterday's shift.",
      ],
    },
    guideAR: {
      overview:
        "الورديات تُؤطّر جميع الأنشطة المالية في النظام. يجب أن تكون وردية مفتوحة لتسجيل الجلسات والمدفوعات. عند إغلاق الوردية، يحسب النظام الكاش المتوقع ويسجّل أي فارق. يراجع المديرون تقارير الورديات للتناقضات.",
      steps: [
        "انتقل إلى 'الورديات' من الشريط الجانبي أو اضغط 'فتح وردية' من اللوحة الرئيسية.",
        "اضغط 'فتح وردية' — أدخل مبلغ الكاش الافتتاحي في الصندوق.",
        "تُتتبَّع الآن جميع الجلسات والمدفوعات والطلبات ضمن هذه الوردية.",
        "لإغلاق الوردية، اضغط 'إغلاق الوردية'.",
        "أدخل الكاش الفعلي المعدود في الصندوق.",
        "يعرض النظام الفارق (الكاش المتوقع مقابل الفعلي).",
        "أضف أي ملاحظات لتقرير الوردية وأكّد الإغلاق.",
        "اعرض ملخصات الورديات السابقة في قائمة سجل الورديات.",
      ],
      buttons: [
        "فتح وردية — يبدأ وردية جديدة بمبلغ كاش افتتاحي.",
        "إغلاق الوردية — ينهي الوردية ويسجّل تسوية الكاش.",
        "عرض تقرير الوردية — يفتح التفصيل الكامل لوردية مغلقة.",
      ],
      fields: [
        "الكاش الافتتاحي — مبلغ الكاش في الصندوق عند بداية الوردية.",
        "الكاش الختامي — الكاش المادي المعدود عند نهاية الوردية.",
        "الفارق — يُحسَب تلقائياً: الكاش المتوقع ناقص الفعلي.",
        "ملاحظات الوردية — نص اختياري لملاحظات التسليم أو شرح التناقضات.",
      ],
      bestPractices: [
        "عدّ الكاش بعناية قبل إدخال مبالغ الفتح والإغلاق.",
        "أغلق الورديات في نهاية كل يوم عمل، وليس أسبوعياً.",
        "استخدم ملاحظات الوردية لشرح أي فارق — حتى الصغيرة منه.",
        "راجع اتجاهات فوارق الورديات بمرور الوقت لاكتشاف العجوزات المتكررة.",
      ],
      commonMistakes: [
        "العمل دون وردية مفتوحة — لن تُسجَّل أي جلسات أو مدفوعات.",
        "إدخال الكاش الختامي دون عدّ فعلي — التخمين ينشئ فوارق كاذبة.",
        "ترك وردية مفتوحة طوال الليل — تختلط أنشطة اليوم التالي في وردية أمس.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Shifts are the backbone of financial tracking. Every transaction in the system is tied to an open shift.",
        voiceoverAR: "الورديات هي العمود الفقري لتتبع الأموال. كل معاملة في النظام مرتبطة بوردية مفتوحة.",
        screenAction: "Show the Shifts page with one active shift and history below.",
      },
      {
        scene: 2,
        voiceoverEN: "Click Open Shift, enter your starting cash amount, and you're ready to take sessions and payments.",
        voiceoverAR: "اضغط 'فتح وردية'، أدخل مبلغ الكاش الافتتاحي، وأنت جاهز لاستقبال الجلسات والمدفوعات.",
        screenAction: "Click Open Shift, enter opening cash amount, confirm.",
      },
      {
        scene: 3,
        voiceoverEN: "At end of day, count your cash, enter the amount, and close the shift. The system shows any variance instantly.",
        voiceoverAR: "في نهاية اليوم، عدّ الكاش، أدخل المبلغ، وأغلق الوردية. يعرض النظام أي فارق فوراً.",
        screenAction: "Click Close Shift, enter physical cash amount, show variance calculation.",
      },
    ],
  },

  {
    id: "users",
    nameEN: "Users",
    nameAR: "المستخدمين",
    descriptionEN: "Create and manage staff accounts with roles and access control.",
    descriptionAR: "إنشاء وإدارة حسابات الموظفين مع الأدوار والتحكم في الوصول.",
    roles: ["owner"],
    guideEN: {
      overview:
        "The Users module lets owners create staff accounts, assign roles, and control access to the system. Each user gets a unique email and password to log in. Roles determine what each staff member can see and do.",
      steps: [
        "Navigate to 'Users' from the sidebar (Owner only).",
        "Click 'Add User' to create a new staff account.",
        "Enter the staff member's name (Arabic and English), email, and password.",
        "Select their role: Manager, Cashier, or Buffet Worker.",
        "Click Save — the account is created and the staff member can log in.",
        "To edit a user, click the edit icon and modify their details.",
        "To deactivate a user, set their status to inactive or delete the account.",
      ],
      buttons: [
        "Add User — opens the user creation form.",
        "Edit icon — opens the edit form for an existing user.",
        "Delete icon — removes the user account.",
      ],
      fields: [
        "Arabic Name — displayed in session and order records.",
        "English Name — used in bilingual contexts.",
        "Email — used to log in to the system.",
        "Password — initial password (staff should change it after first login).",
        "Role — Manager, Cashier, or Buffet Worker.",
      ],
      bestPractices: [
        "Create individual accounts for each staff member — never share credentials.",
        "Use strong passwords and advise staff to change them after first login.",
        "Remove accounts immediately when a staff member leaves.",
        "Assign the minimum role necessary — cashiers shouldn't have manager access.",
      ],
      commonMistakes: [
        "Sharing a single account among multiple cashiers — makes audit logs meaningless.",
        "Not removing accounts when staff leave — creates a security risk.",
        "Assigning manager role to cashiers who don't need it.",
      ],
    },
    guideAR: {
      overview:
        "وحدة المستخدمين تتيح للمالكين إنشاء حسابات الموظفين وتعيين الأدوار والتحكم في الوصول للنظام. يحصل كل مستخدم على بريد إلكتروني وكلمة مرور فريدة لتسجيل الدخول. تحدد الأدوار ما يمكن لكل موظف رؤيته وفعله.",
      steps: [
        "انتقل إلى 'المستخدمين' من الشريط الجانبي (المالك فقط).",
        "اضغط 'إضافة مستخدم' لإنشاء حساب موظف جديد.",
        "أدخل اسم الموظف (بالعربية والإنجليزية)، البريد الإلكتروني، وكلمة المرور.",
        "اختر دوره: مدير، كاشير، أو عامل بوفيه.",
        "اضغط حفظ — يُنشأ الحساب ويستطيع الموظف تسجيل الدخول.",
        "لتعديل مستخدم، اضغط أيقونة التعديل وعدّل تفاصيله.",
        "لإلغاء تفعيل مستخدم، اضبط حالته كغير نشط أو احذف الحساب.",
      ],
      buttons: [
        "إضافة مستخدم — يفتح نموذج إنشاء مستخدم.",
        "أيقونة التعديل — تفتح نموذج التعديل لمستخدم موجود.",
        "أيقونة الحذف — تزيل حساب المستخدم.",
      ],
      fields: [
        "الاسم بالعربية — يظهر في سجلات الجلسات والطلبات.",
        "الاسم بالإنجليزية — يُستخدم في السياقات ثنائية اللغة.",
        "البريد الإلكتروني — يُستخدم لتسجيل الدخول في النظام.",
        "كلمة المرور — كلمة المرور الأولية (يجب أن يغيّرها الموظف بعد أول دخول).",
        "الدور — مدير، كاشير، أو عامل بوفيه.",
      ],
      bestPractices: [
        "أنشئ حسابات فردية لكل موظف — لا تشارك البيانات أبداً.",
        "استخدم كلمات مرور قوية وأخبر الموظفين بتغييرها بعد أول دخول.",
        "احذف الحسابات فوراً عند مغادرة موظف.",
        "عيّن الحد الأدنى من الصلاحيات اللازمة — الكاشيرون لا يحتاجون صلاحيات المدير.",
      ],
      commonMistakes: [
        "مشاركة حساب واحد بين كاشيرين متعددين — يجعل سجلات المراجعة بلا معنى.",
        "عدم حذف الحسابات عند مغادرة الموظفين — يُشكّل خطراً أمنياً.",
        "تعيين دور مدير للكاشيرين الذين لا يحتاجونه.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "The Users module is where you create accounts for every staff member — cashiers, managers, and kitchen staff.",
        voiceoverAR: "وحدة المستخدمين هي المكان الذي تنشئ فيه حسابات لكل موظف — كاشيرين ومديرين وموظفي مطبخ.",
        screenAction: "Show the Users page with existing staff accounts.",
      },
      {
        scene: 2,
        voiceoverEN: "Click Add User, fill in their name, email, and initial password, then select their role and save.",
        voiceoverAR: "اضغط 'إضافة مستخدم'، أدخل اسمهم والبريد الإلكتروني وكلمة المرور الأولية، اختر دورهم واحفظ.",
        screenAction: "Open Add User dialog, fill fields, select role Cashier, click Save.",
      },
    ],
  },

  {
    id: "roles",
    nameEN: "Roles & Permissions",
    nameAR: "الأدوار والصلاحيات",
    descriptionEN: "Understand the five system roles and what each role can access.",
    descriptionAR: "فهم الأدوار الخمسة في النظام وما يستطيع كل دور الوصول إليه.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "Gaming Lounge OS has five roles: Platform Owner (system admin), Owner (venue owner), Manager, Cashier, and Buffet Worker. Roles are fixed by the system — you assign the appropriate role when creating a user account.",
      steps: [
        "Understand each role before creating user accounts.",
        "Platform Owner — full system access including tenant management (used by the software provider).",
        "Owner — full access to their venue including Finance, Users, and all management modules.",
        "Manager — access to operational and management modules; no Finance capital or withdrawals.",
        "Cashier — access to Sessions, POS, Orders, Payments, Shifts, and Assets.",
        "Buffet Worker — access to Kitchen Display (KDS) and Orders only.",
        "Assign roles in the Users module when creating staff accounts.",
        "Roles cannot be partially customized — each role has a fixed permission set.",
      ],
      buttons: [
        "No buttons in this module — roles are managed via the Users module.",
      ],
      fields: [
        "Role — selected when creating a user; determines what the user can see and do.",
      ],
      bestPractices: [
        "Give cashiers the Cashier role — they don't need manager-level visibility.",
        "Use the Buffet Worker role for kitchen staff who only need to see the KDS.",
        "Assign the Manager role sparingly — it includes audit logs and performance data.",
        "Never share the Owner account; the Owner has access to all financial records.",
      ],
      commonMistakes: [
        "Giving all staff the Manager role for convenience — creates security and privacy risks.",
        "Assigning Buffet Worker to cashiers — they won't have access to Sessions or POS.",
        "Giving a cashier Owner access temporarily — always reset after the need passes.",
      ],
    },
    guideAR: {
      overview:
        "يحتوي نظام جيمينج لاونج على خمسة أدوار: مالك النظام (مشرف النظام)، مالك (صاحب المركز)، مدير، كاشير، وعامل بوفيه. الأدوار ثابتة من قِبَل النظام — تُعيّن الدور المناسب عند إنشاء حساب مستخدم.",
      steps: [
        "افهم كل دور قبل إنشاء حسابات المستخدمين.",
        "مالك النظام — وصول كامل للنظام بما في ذلك إدارة المستأجرين (يستخدمه مزود البرنامج).",
        "مالك — وصول كامل لمركزه بما في ذلك المالية والمستخدمين وجميع وحدات الإدارة.",
        "مدير — وصول للوحدات التشغيلية والإدارية؛ بدون رأس مال أو سحوبات المالية.",
        "كاشير — وصول للجلسات ونقطة البيع والطلبات والمدفوعات والورديات والأصول.",
        "عامل بوفيه — وصول لشاشة المطبخ (KDS) والطلبات فقط.",
        "عيّن الأدوار في وحدة المستخدمين عند إنشاء حسابات الموظفين.",
        "لا يمكن تخصيص الأدوار جزئياً — لكل دور مجموعة صلاحيات ثابتة.",
      ],
      buttons: [
        "لا توجد أزرار في هذه الوحدة — تُدار الأدوار عبر وحدة المستخدمين.",
      ],
      fields: [
        "الدور — يُحدَّد عند إنشاء مستخدم؛ يحدد ما يستطيع المستخدم رؤيته وفعله.",
      ],
      bestPractices: [
        "أعطِ الكاشيرين دور 'كاشير' — لا يحتاجون مستوى رؤية المدير.",
        "استخدم دور 'عامل بوفيه' للموظفين في المطبخ الذين يحتاجون فقط رؤية شاشة المطبخ.",
        "عيّن دور 'مدير' بحرص — يشمل سجلات المراجعة وبيانات الأداء.",
        "لا تشارك حساب المالك أبداً؛ يمتلك المالك الوصول لجميع السجلات المالية.",
      ],
      commonMistakes: [
        "إعطاء جميع الموظفين دور 'مدير' للسهولة — يُنشئ مخاطر أمنية وخصوصية.",
        "تعيين 'عامل بوفيه' للكاشيرين — لن يكون لديهم وصول للجلسات أو نقطة البيع.",
        "إعطاء كاشير وصول المالك مؤقتاً — أعد ضبطه دائماً بعد انتهاء الحاجة.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Gaming Lounge OS has five roles — each with exactly the access they need to do their job.",
        voiceoverAR: "نظام جيمينج لاونج يحتوي خمسة أدوار — كل منها لديه بالضبط الوصول اللازم لأداء عمله.",
        screenAction: "Show a role comparison table or the user creation dialog with role dropdown.",
      },
      {
        scene: 2,
        voiceoverEN: "Owner gets full access. Manager can run operations. Cashier handles sessions and POS. Buffet Worker sees only the kitchen display.",
        voiceoverAR: "المالك لديه وصول كامل. المدير يدير العمليات. الكاشير يتعامل مع الجلسات ونقطة البيع. عامل البوفيه يرى شاشة المطبخ فقط.",
        screenAction: "Highlight each role in the dropdown as described.",
      },
    ],
  },

  {
    id: "audit",
    nameEN: "Audit Logs",
    nameAR: "سجل العمليات",
    descriptionEN: "Full activity trail of all user actions in the system for accountability.",
    descriptionAR: "مسار كامل لجميع إجراءات المستخدمين في النظام للمساءلة.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "Audit Logs record every significant action taken in the system — who did what, when, and on which record. This module is essential for accountability, dispute resolution, and identifying unusual behavior.",
      steps: [
        "Navigate to 'Audit Logs' from the sidebar.",
        "View the chronological list of all system events.",
        "Filter by user, action type, or date range to narrow results.",
        "Click an entry to see the full details of what changed.",
        "Export logs for external review or compliance needs.",
      ],
      buttons: [
        "Filter controls — filter by user, action, or date.",
        "Export — downloads the filtered log for external use.",
        "Entry expand — shows full before/after detail for the action.",
      ],
      fields: [
        "User — who performed the action.",
        "Action — what was done (e.g., Session Started, Discount Approved, Payment Confirmed).",
        "Timestamp — exact date and time of the action.",
        "Record — the specific order, session, or entity affected.",
        "Details — what changed, including before and after values where applicable.",
      ],
      bestPractices: [
        "Review audit logs weekly for anything unusual — unexpected discount approvals or deletions.",
        "Use logs to resolve disputes between staff about who did what.",
        "Export and archive logs monthly for long-term record keeping.",
        "Train managers to check logs when discrepancies are found in shift reports.",
      ],
      commonMistakes: [
        "Never reviewing audit logs — issues go undetected until they cause real damage.",
        "Overlooking repeated discount approvals by the same user — could indicate abuse.",
      ],
    },
    guideAR: {
      overview:
        "سجلات المراجعة تُسجّل كل إجراء مهم في النظام — من فعل ماذا، متى، وعلى أي سجل. هذه الوحدة ضرورية للمساءلة وحل النزاعات وتحديد السلوك غير الطبيعي.",
      steps: [
        "انتقل إلى 'سجل العمليات' من الشريط الجانبي.",
        "اعرض القائمة الزمنية لجميع أحداث النظام.",
        "صفّ حسب المستخدم أو نوع الإجراء أو نطاق التاريخ لتضييق النتائج.",
        "اضغط إدخالاً لرؤية التفاصيل الكاملة لما تغيّر.",
        "صدّر السجلات للمراجعة الخارجية أو متطلبات الامتثال.",
      ],
      buttons: [
        "أدوات التصفية — تصفية حسب المستخدم أو الإجراء أو التاريخ.",
        "تصدير — يُنزّل السجل المصفى للاستخدام الخارجي.",
        "توسيع الإدخال — يعرض التفاصيل الكاملة لما قبل وبعد الإجراء.",
      ],
      fields: [
        "المستخدم — من نفّذ الإجراء.",
        "الإجراء — ما تم فعله (مثل: بدء جلسة، موافقة على خصم، تأكيد دفع).",
        "الطابع الزمني — التاريخ والوقت الدقيقان للإجراء.",
        "السجل — الطلب أو الجلسة أو الكيان المحدد المتأثر.",
        "التفاصيل — ما الذي تغيّر، بما في ذلك القيم قبل وبعد الإجراء عند الاقتضاء.",
      ],
      bestPractices: [
        "راجع سجلات المراجعة أسبوعياً لأي شيء غير عادي — موافقات خصم أو حذف غير متوقع.",
        "استخدم السجلات لحل النزاعات بين الموظفين حول من فعل ماذا.",
        "صدّر السجلات وأرشفها شهرياً للاحتفاظ بالسجلات على المدى الطويل.",
        "درّب المديرين على التحقق من السجلات عند اكتشاف تناقضات في تقارير الورديات.",
      ],
      commonMistakes: [
        "عدم مراجعة سجلات المراجعة قط — تمر المشكلات دون اكتشاف حتى تتسبب في ضرر حقيقي.",
        "إغفال موافقات خصم متكررة من نفس المستخدم — قد تشير إلى إساءة استخدام.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Audit Logs record every action in the system — giving you full accountability over what your staff does.",
        voiceoverAR: "سجلات المراجعة تُسجّل كل إجراء في النظام — مانحةً إياك مساءلة كاملة على ما يفعله موظفوك.",
        screenAction: "Show the Audit Logs page with a chronological list of events.",
      },
      {
        scene: 2,
        voiceoverEN: "Filter by user or date to investigate a specific incident — you can see exactly what changed and when.",
        voiceoverAR: "صفّ حسب المستخدم أو التاريخ للتحقيق في حادثة محددة — يمكنك رؤية ما الذي تغيّر ومتى بالضبط.",
        screenAction: "Apply a user filter, click an entry to expand its details.",
      },
    ],
  },

  {
    id: "settings",
    nameEN: "Settings",
    nameAR: "الإعدادات",
    descriptionEN: "Configure venue name, branding, and system behavior preferences.",
    descriptionAR: "تهيئة اسم المركز والعلامة التجارية وتفضيلات سلوك النظام.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "Settings lets you configure your venue's name, branding, and operational preferences — like the KDS urgency timer. Changes take effect immediately across all modules.",
      steps: [
        "Navigate to 'Settings' from the sidebar.",
        "Update the venue name (Arabic and English) as needed.",
        "Adjust the KDS urgency timer — the number of minutes before an order card flashes red.",
        "Configure any other operational preferences shown on the page.",
        "Click Save to apply changes.",
      ],
      buttons: [
        "Save — applies all changes to the settings.",
        "Reset to Defaults — restores original settings (where available).",
      ],
      fields: [
        "Venue Name (Arabic) — appears in receipts and on-screen branding.",
        "Venue Name (English) — used in bilingual or exported documents.",
        "KDS Urgency Timer (minutes) — threshold before kitchen orders flash red.",
      ],
      bestPractices: [
        "Set the KDS urgency timer based on your kitchen's realistic prep time.",
        "Keep venue names consistent with what appears on your physical receipts.",
        "Review settings after onboarding new staff to ensure preferences are still appropriate.",
      ],
      commonMistakes: [
        "Setting the urgency timer too low — everything turns red immediately, causing alarm fatigue.",
        "Setting the urgency timer too high — genuine late orders won't get attention.",
        "Not updating the venue name when rebranding — old name appears on receipts.",
      ],
    },
    guideAR: {
      overview:
        "الإعدادات تتيح تهيئة اسم مركزك والعلامة التجارية والتفضيلات التشغيلية — كمؤقت الإلحاح في شاشة المطبخ. تسري التغييرات فوراً في جميع الوحدات.",
      steps: [
        "انتقل إلى 'الإعدادات' من الشريط الجانبي.",
        "حدّث اسم المركز (بالعربية والإنجليزية) حسب الحاجة.",
        "اضبط مؤقت إلحاح شاشة المطبخ — عدد الدقائق قبل أن تومض بطاقة الطلب باللون الأحمر.",
        "هيّئ أي تفضيلات تشغيلية أخرى تظهر على الصفحة.",
        "اضغط 'حفظ' لتطبيق التغييرات.",
      ],
      buttons: [
        "حفظ — يطبّق جميع التغييرات على الإعدادات.",
        "إعادة التعيين للافتراضيات — يستعيد الإعدادات الأصلية (حيثما كان متاحاً).",
      ],
      fields: [
        "اسم المركز (بالعربية) — يظهر في الإيصالات والعلامة التجارية على الشاشة.",
        "اسم المركز (بالإنجليزية) — يُستخدم في المستندات ثنائية اللغة أو المصدَّرة.",
        "مؤقت إلحاح شاشة المطبخ (بالدقائق) — العتبة قبل أن تومض طلبات المطبخ باللون الأحمر.",
      ],
      bestPractices: [
        "اضبط مؤقت الإلحاح بناءً على وقت التحضير الواقعي في مطبخك.",
        "حافظ على تطابق أسماء المركز مع ما يظهر على إيصالاتك المادية.",
        "راجع الإعدادات بعد إضافة موظفين جدد للتأكد من أن التفضيلات لا تزال مناسبة.",
      ],
      commonMistakes: [
        "ضبط مؤقت الإلحاح على قيمة منخفضة جداً — يتحول كل شيء للأحمر فوراً مما يسبب إجهاد التنبيهات.",
        "ضبطه على قيمة مرتفعة جداً — الطلبات المتأخرة فعلاً لن تحظى بالاهتمام.",
        "عدم تحديث اسم المركز عند إعادة التسمية — يظهر الاسم القديم على الإيصالات.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Settings is where you configure your venue name and key system behaviors like the kitchen urgency timer.",
        voiceoverAR: "الإعدادات هي المكان الذي تهيّئ فيه اسم مركزك والسلوكيات الرئيسية للنظام كمؤقت الإلحاح في المطبخ.",
        screenAction: "Show the Settings page.",
      },
      {
        scene: 2,
        voiceoverEN: "Set the KDS urgency timer to match how long your kitchen typically takes to prepare an order.",
        voiceoverAR: "اضبط مؤقت الإلحاح ليتوافق مع المدة التي يستغرقها مطبخك عادةً لتحضير طلب.",
        screenAction: "Highlight the urgency timer field, change value, click Save.",
      },
    ],
  },

  {
    id: "reports",
    nameEN: "Reports",
    nameAR: "التقارير",
    descriptionEN: "Access financial and performance reports for data-driven decisions.",
    descriptionAR: "الوصول إلى التقارير المالية وتقارير الأداء لاتخاذ قرارات مبنية على البيانات.",
    roles: ["owner", "manager"],
    guideEN: {
      overview:
        "Reports (under Finance > Reports) provide summarized views of the business performance: daily summaries, profit and loss statements, expense breakdowns by category, cash flow, and shift variance reports.",
      steps: [
        "Navigate to 'Finance > Reports'.",
        "Select the report type: Daily Summary, Profit & Loss, Expense Breakdown, Cash Flow, or Shift Variances.",
        "Choose the date or date range for the report.",
        "Click 'Generate Report' to compute and display the data.",
        "Review the charts and tables in the report view.",
        "Export or print the report for external use.",
      ],
      buttons: [
        "Generate Report — computes the selected report for the chosen period.",
        "Export — downloads the report as a file.",
        "Print — opens the browser print dialog.",
      ],
      fields: [
        "Report Type — Daily Summary, P&L, Expense Breakdown, Cash Flow, Shift Variances.",
        "Date / Date Range — the period covered by the report.",
      ],
      bestPractices: [
        "Generate a Daily Summary every morning to review yesterday's performance.",
        "Run the Profit & Loss report monthly to track financial health trends.",
        "Use Expense Breakdown to identify the largest cost categories and find savings.",
        "Review Shift Variance reports to investigate cashiers with repeated discrepancies.",
      ],
      commonMistakes: [
        "Only checking reports monthly — by then, small problems have grown.",
        "Generating reports without understanding what each section means — use the Finance Overview first to build familiarity.",
      ],
    },
    guideAR: {
      overview:
        "التقارير (ضمن المالية > التقارير) توفر عروضاً ملخصة لأداء الأعمال: ملخصات يومية وبيانات الأرباح والخسائر وتفاصيل المصروفات حسب الفئة والتدفق النقدي وتقارير فوارق الورديات.",
      steps: [
        "انتقل إلى 'المالية > التقارير'.",
        "اختر نوع التقرير: ملخص يومي، أرباح وخسائر، تفاصيل المصروفات، تدفق نقدي، أو فوارق الورديات.",
        "اختر التاريخ أو نطاق التاريخ للتقرير.",
        "اضغط 'إنشاء التقرير' لحساب وعرض البيانات.",
        "راجع المخططات والجداول في عرض التقرير.",
        "صدّر التقرير أو اطبعه للاستخدام الخارجي.",
      ],
      buttons: [
        "إنشاء التقرير — يحسب التقرير المحدد للفترة المختارة.",
        "تصدير — يُنزّل التقرير كملف.",
        "طباعة — يفتح نافذة طباعة المتصفح.",
      ],
      fields: [
        "نوع التقرير — ملخص يومي، أرباح وخسائر، تفاصيل مصروفات، تدفق نقدي، فوارق ورديات.",
        "التاريخ / نطاق التاريخ — الفترة التي يغطيها التقرير.",
      ],
      bestPractices: [
        "أنشئ ملخصاً يومياً كل صباح لمراجعة أداء أمس.",
        "شغّل تقرير الأرباح والخسائر شهرياً لتتبع اتجاهات الصحة المالية.",
        "استخدم تفاصيل المصروفات لتحديد أكبر فئات التكلفة وإيجاد المدخرات.",
        "راجع تقارير فوارق الورديات للتحقيق في الكاشيرين الذين يعانون من تناقضات متكررة.",
      ],
      commonMistakes: [
        "التحقق من التقارير شهرياً فقط — تكون المشكلات الصغيرة قد كبرت بحلول ذلك الوقت.",
        "إنشاء تقارير دون فهم ما تعنيه كل أقسام — استخدم نظرة مالية عامة أولاً لبناء الإلفة.",
      ],
    },
    videoScript: [
      {
        scene: 1,
        voiceoverEN: "Reports give you the data-driven view of your business — profit, expenses, cash flow, and shift variances.",
        voiceoverAR: "التقارير تمنحك الرؤية المبنية على البيانات لأعمالك — الأرباح والمصروفات والتدفق النقدي وفوارق الورديات.",
        screenAction: "Show Finance > Reports page with report type selector.",
      },
      {
        scene: 2,
        voiceoverEN: "Select your report type, pick a date range, and click Generate. Review the charts and export when ready.",
        voiceoverAR: "اختر نوع التقرير، حدّد نطاق التاريخ، واضغط 'إنشاء'. راجع المخططات وصدّر عند الاستعداد.",
        screenAction: "Select Profit & Loss, pick a month range, click Generate Report. Show the report output.",
      },
    ],
  },
];
