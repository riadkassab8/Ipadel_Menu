(() => {
  const root = document.documentElement;
  const body = document.body;
  const storageKey = 'ipadel-language';
  let language = 'en';
  try { language = localStorage.getItem(storageKey) === 'ar' ? 'ar' : 'en'; } catch {}
  const words = {
    'ipadel home':'الصفحة الرئيسية لآيبادل','ipadel — start now':'آيبادل — ابدأ الآن','main navigation':'القائمة الرئيسية',
    'switch to arabic':'التبديل إلى العربية','switch to english':'التبديل إلى الإنجليزية','the ipadel club menu':'قائمة نادي آيبادل',
    'fuel':'استعد','your':'لعبتك','game.':'!','good drinks. great games.':'مشروبات منعشة. مباريات رائعة.','good drinks.':'مشروبات منعشة.','great games.':'مباريات رائعة.',
    'ipadel | good drinks. great games.':'آيبادل | مشروبات منعشة. مباريات رائعة.','the drinks bar | ipadel':'ركن المشروبات | آيبادل','the canteen | ipadel':'الكانتينا | آيبادل',
    'drinks':'المشروبات','canteen':'الكانتينا','soon':'قريبًا','refresh your game':'انتعش واستعد للعب','refresh your game.':'انتعش واستعد للعب.','menu coming soon':'القائمة قريبًا',
    'memory basket':'سلة التذكّر','memory':'التذكّر','basket':'السلة','open memory basket':'افتح سلة التذكّر','close memory basket':'أغلق سلة التذكّر',
    'your personal counter reminder, saved on this device only.':'تذكيرك الشخصي للطلب من الكاونتر، محفوظ على هذا الجهاز فقط.',
    'refreshing drinks beside the padel court':'مشروبات منعشة بجوار ملعب البادل','between matches':'بين المباريات','ipadel club / 01':'آيبادل / النادي ٠١',
    'pause.':'استرح.','reset.':'استعد.','play.':'العب.','the club-side menu':'قائمة النادي بجانب الملعب','a moment between matches':'استراحة بين المباريات',
    'find your next courtside refresh. keep a note of it here, then order at the counter.':'اختر مشروبك المنعش القادم بجانب الملعب، وسجّله هنا ثم اطلبه من الكاونتر.',
    'club-side menu':'قائمة النادي بجانب الملعب','ipadel / club-side':'آيبادل / بجانب الملعب','ipadel / start now':'آيبادل / ابدأ الآن','ipadel / club menu':'آيبادل / قائمة النادي','repeat.':'كرّر.','your picks':'اختياراتك','personal list':'قائمة شخصية',
    'clear your':'هل تريد إفراغ','memory basket?':'سلة التذكّر؟','this only removes the reminder saved on this device.':'سيؤدي هذا فقط إلى حذف التذكير المحفوظ على هذا الجهاز.',
    'keep picks':'احتفظ بالاختيارات','clear list':'إفراغ القائمة','items':'عناصر','item':'عنصر',
    'ipadel / club menu — 01':'آيبادل / قائمة النادي — ٠١','the drinks':'المشروبات','bar.':'','for the pause between points.':'لاستراحة قصيرة بين النقاط.',
    'find a favorite, save it for the counter.':'اختر ما تحب واحفظه لتطلبه من الكاونتر.','back to ipadel':'العودة إلى آيبادل','01 / the menu':'٠١ / القائمة',
    'drinks only · sample menu':'مشروبات فقط · قائمة تجريبية','take a breather':'التقط أنفاسك','pick your':'اختر','reset':'مشروبك',
    'six club-side favorites, shown as a sample.':'ستة مشروبات مفضلة معروضة على سبيل التجربة.','prices and details are examples only.':'الأسعار والتفاصيل أمثلة توضيحية فقط.',
    'filter drinks by category':'تصفية المشروبات حسب الفئة','search drinks':'ابحث عن المشروبات','find a drink':'ابحث عن مشروب','demo only':'للتجربة فقط',
    '— all six drinks, descriptions and prices are examples for menu presentation. final club menu may differ.':'— المشروبات الستة والأوصاف والأسعار أمثلة للعرض فقط، وقد تختلف القائمة النهائية للنادي.',
    'nothing on this court.':'لا توجد نتائج هنا.','no match / 00':'لا توجد نتائج / ٠٠','try another search or switch the category filter.':'جرّب كلمة بحث أخرى أو غيّر تصنيف المشروبات.','reset filters':'إعادة ضبط التصفية',
    'keep it personal / 01':'خاصة بك / ٠١','your list, your device':'قائمتك على جهازك','remember it':'تذكّره','at the counter.':'عند الكاونتر.',
    'memory basket is a personal reminder only. nothing is sent to the club or staff.':'سلة التذكّر للتذكير الشخصي فقط. لا تُرسل أي بيانات إلى النادي أو العاملين فيه.',
    'drinks bar':'ركن المشروبات','example price':'سعر توضيحي','size':'الحجم','choose size':'اختر الحجم','quantity':'الكمية',
    'decrease quantity':'تقليل الكمية','increase quantity':'زيادة الكمية','close drink details':'إغلاق تفاصيل المشروب','add to memory':'أضف إلى التذكّر',
    'personal reminder · stored on this device':'تذكير شخصي · محفوظ على هذا الجهاز','ipadel / club menu — 02':'آيبادل / قائمة النادي — ٠٢',
    'the':'','your next break':'استراحتك القادمة','is loading.':'قيد التحضير.','our canteen menu':'قائمة الكانتينا','is coming soon.':'قريبًا.',
    'back to drinks':'العودة إلى المشروبات','ipadel / next up':'آيبادل / قريبًا','coming':'قريبًا','a new club-side ritual':'طقس جديد بجانب الملعب',
    'the canteen / next up':'الكانتينا / قريبًا','until then':'إلى ذلك الحين','take a breather. find your next courtside refresh.':'التقط أنفاسك واختر مشروبك المنعش القادم بجانب الملعب.',
    'explore the drinks bar':'اكتشف ركن المشروبات','canteen / soon':'الكانتينا / قريبًا','your basket is waiting.':'سلتك بانتظارك.',
    'explore the drinks menu and save what you would like to remember.':'تصفّح قائمة المشروبات واحفظ ما تريد تذكّره.','browse drinks':'تصفّح المشروبات',
    'estimated total · sample prices':'الإجمالي التقديري · أسعار تجريبية','clear basket':'إفراغ السلة','done':'تم','personal reminder only.':'تذكير شخصي فقط.',
    'it stays on this device and is':'يبقى على هذا الجهاز ولا يتم','not sent to staff.':'إرساله إلى العاملين.','take your list to the counter to order.':'أظهر قائمتك عند الكاونتر لإتمام الطلب.',
    'your list stays on this device. it is':'تبقى قائمتك على هذا الجهاز ولا يتم','not sent to staff':'إرسالها إلى العاملين',
    'added to memory basket':'تمت الإضافة إلى سلة التذكّر','removed from memory basket':'تمت الإزالة من سلة التذكّر','memory basket cleared':'تم إفراغ سلة التذكّر',
    'could not save on this device':'تعذّر الحفظ على هذا الجهاز','all drinks':'كل المشروبات','hot':'ساخن','cold':'بارد','juices':'عصائر','water':'مياه','energy':'طاقة',
    'espresso':'إسبريسو','cappuccino':'كابتشينو','iced coffee':'قهوة مثلجة','citrus cooler':'منعش الحمضيات','still water':'مياه معدنية','energy fizz':'مشروب الطاقة',
    'a short, bold coffee shot for the reset between sets.':'قهوة قصيرة وقوية لاستعادة التركيز بين الأشواط.',
    'rich espresso softened with silky steamed milk.':'إسبريسو غني مع حليب مبخر ناعم.',
    'chilled coffee over ice. cool head, quick restart.':'قهوة باردة مع الثلج لانتعاش سريع واستعداد من جديد.',
    'a bright citrus blend made for a sunny court-side break.':'مزيج حمضيات منعش لاستراحة مشمسة بجانب الملعب.',
    'simple, crisp hydration between games.':'مياه منعشة لترطيبك بين المباريات.','a sparkling pick-me-up when the match goes long.':'مشروب غازي يمنحك النشاط عندما تطول المباراة.',
    'remove':'إزالة','drink':'مشروب','regular':'عادي','large':'كبير','single':'فردي','double':'مزدوج','demo':'تجريبي','view details':'عرض التفاصيل'
  };
  const normalize = value => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('en');
  function translate(value) {
    const key = normalize(value);
    if (Object.prototype.hasOwnProperty.call(words, key)) return words[key];
    let m = value.match(/^\s*(Single|Double|Regular|Large)\s*[·•]\s*(\d+(?:\.\d+)?)\s*EGP\s*$/i);
    if (m) return `${words[normalize(m[1])]} · ${m[2]} ج.م`;
    m = value.match(/^\s*(Regular|Single|Double|Large)?\s*[·•]\s*(\d+(?:\.\d+)?)\s*EGP\s+each\s*[·•]\s*DEMO\s*$/i);
    if (m) return `${m[1] ? `${words[normalize(m[1])]} · ` : ''}${m[2]} ج.م للقطعة · تجريبي`;
    m = value.match(/^\s*(\d+(?:\.\d+)?)\s*EGP\s*[·•]\s*DEMO\s*$/i);
    if (m) return `${m[1]} ج.م · تجريبي`;
    m = value.match(/^\s*(\d+(?:\.\d+)?)\s*EGP\s*$/i);
    if (m) return `${m[1]} ج.م`;
    m = value.match(/^\s*(\d+)\s+(ITEM|ITEMS)\s*$/i);
    if (m) return `${m[1]} ${m[1] === '1' ? 'عنصر' : 'عناصر'}`;
    m = value.match(/^\s*View\s+(.+?)\s+details\s*$/i);
    if (m) return `عرض تفاصيل ${translate(m[1])}`;
    m = value.match(/^\s*Save\s+(.+?)\s+to\s+Memory Basket\s*$/i);
    if (m) return `أضف ${translate(m[1])} إلى سلة التذكّر`;
    m = value.match(/^\s*(Decrease|Increase)\s+(.+?)\s+quantity\s*$/i);
    if (m) return `${m[1].toLowerCase() === 'decrease' ? 'تقليل' : 'زيادة'} كمية ${translate(m[2])}`;
    m = value.match(/^\s*Remove\s+(.+)\s*$/i);
    if (m) return `إزالة ${translate(m[1])}`;
    return value;
  }
  function translateNode(node) {
    const value = node.nodeValue;
    if (!value || !value.trim()) return;
    const lead = value.match(/^\s*/)[0];
    const tail = value.match(/\s*$/)[0];
    const core = value.slice(lead.length, value.length - tail.length || value.length);
    const result = translate(core);
    if (result !== core) node.nodeValue = lead + result + tail;
  }
  function apply() {
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    body.classList.toggle('arabic-mode', language === 'ar');
    document.querySelectorAll('[data-language-toggle]').forEach(button => {
      const label = language === 'ar' ? 'English' : 'عربي';
      if (button.textContent !== label) button.textContent = label;
      button.setAttribute('aria-label', language === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic');
    });
    if (language !== 'ar') return;
    const page = location.pathname.toLowerCase();
    document.title = translate(document.title);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = page.endsWith('drinks.html')
      ? 'تصفّح قائمة مشروبات آيبادل التجريبية، واحفظ تذكيرًا شخصيًا على جهازك للطلب من الكاونتر.'
      : page.endsWith('canteen.html')
        ? 'قائمة كانتينا آيبادل قريبًا. تصفّح المشروبات في هذه الأثناء.'
        : 'قائمة النادي لاستراحة ما بين المباريات. تصفّح المشروبات واحفظ تذكيرًا شخصيًا على هذا الجهاز.';
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateNode(node);
    document.querySelectorAll('[placeholder], [aria-label], [title], img[alt]').forEach(node => {
      ['placeholder', 'aria-label', 'title', 'alt'].forEach(attr => {
        if (!node.hasAttribute(attr)) return;
        const oldValue = node.getAttribute(attr);
        const newValue = translate(oldValue);
        if (newValue !== oldValue) node.setAttribute(attr, newValue);
      });
    });
  }
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-language-toggle]')) return;
    language = language === 'en' ? 'ar' : 'en';
    try { localStorage.setItem(storageKey, language); } catch {}
    if (language === 'en') { location.reload(); return; }
    apply();
  });
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending || language !== 'ar') return;
    pending = true;
    queueMicrotask(() => { pending = false; apply(); });
  });
  observer.observe(body, { childList: true, subtree: true, characterData: true });
  window.IPADEL_LANGUAGE = { apply };
  apply();
})();