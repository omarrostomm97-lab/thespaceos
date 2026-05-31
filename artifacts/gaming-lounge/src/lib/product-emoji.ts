/**
 * Returns an emoji that best represents a product based on its name and category.
 * Matching is done on a combined lowercase string of all fields provided.
 * Order of checks matters — more specific terms come before general ones.
 */
export function getProductEmoji(
  nameAr = "",
  nameEn = "",
  categoryNameAr = "",
  categoryNameEn = ""
): string {
  const t = `${nameAr} ${nameEn} ${categoryNameAr} ${categoryNameEn}`.toLowerCase();

  /* ── Snacks & Food ──────────────────────────────────── */
  if (/شيبس|chips/.test(t))               return "🍟";
  if (/هوهوز|hohoz/.test(t))              return "🍫";
  if (/جالاكسي|galaxy/.test(t))           return "🍫";
  if (/دورو|doro/.test(t))                return "🍫";
  if (/كيك|cake/.test(t))                 return "🎂";
  if (/سندويش|ساندويتش|sandwich/.test(t)) return "🥪";
  if (/بيتزا|pizza/.test(t))              return "🍕";
  if (/برجر|burger/.test(t))              return "🍔";
  if (/نجز|nugget/.test(t))               return "🍗";
  if (/فطيرة|waffle/.test(t))             return "🧇";
  if (/كرواسون|croissant/.test(t))        return "🥐";
  if (/بسكويت|cookie/.test(t))            return "🍪";
  if (/كيك|cupcake/.test(t))              return "🧁";
  if (/آيس كريم|icecream|ice cream/.test(t)) return "🍦";
  if (/مأكولات|food|أكل/.test(t))         return "🍟";

  /* ── Frappe / Blended Iced ──────────────────────────── */
  if (/فراب|frappe|frappé/.test(t))       return "🧋";

  /* ── Iced Coffee / Iced Drinks ─────────────────────── */
  if (/آيس|iced? /.test(t))               return "🧋";

  /* ── Smoothies & Mocktails ──────────────────────────── */
  if (/سموذي|smoothie/.test(t))           return "🥤";
  if (/موهيتو|mojito/.test(t))            return "🍹";
  if (/كوكتيل|cocktail/.test(t))          return "🍹";

  /* ── Juices ─────────────────────────────────────────── */
  if (/ليمون|lemon/.test(t))              return "🍋";
  if (/موز|banana/.test(t))               return "🍌";
  if (/فراولة|strawberry/.test(t))        return "🍓";
  if (/مانجو|mango/.test(t))              return "🥭";
  if (/برتقال|orange/.test(t))            return "🍊";
  if (/تفاح|apple/.test(t))               return "🍎";
  if (/توت|berry/.test(t))                return "🫐";
  if (/جوافة|guava/.test(t))              return "🍃";
  if (/قصب|sugarcane/.test(t))            return "🌿";
  if (/عصير|juice/.test(t))               return "🧃";
  if (/عصائر/.test(t))                    return "🧃";

  /* ── Tea ────────────────────────────────────────────── */
  if (/شاي أخضر|green tea/.test(t))       return "🍵";
  if (/شاي|tea/.test(t))                  return "🍵";

  /* ── Hot Coffee ─────────────────────────────────────── */
  if (/كابتشينو|cappuccino/.test(t))      return "☕";
  if (/ماكياتو|macchiato/.test(t))        return "☕";
  if (/إسبريسو|espresso/.test(t))         return "☕";
  if (/لاتيه|latte/.test(t))              return "☕";
  if (/موكا|mocha/.test(t))               return "☕";
  if (/قهوة فرنساوي|french press/.test(t)) return "☕";
  if (/قهوة|coffee/.test(t))              return "☕";
  if (/فيوري|fiori/.test(t))              return "☕";

  /* ── Other Hot Drinks ───────────────────────────────── */
  if (/سيدر|cider/.test(t))               return "🍎";
  if (/هوت|hot drinks/.test(t))           return "🫖";
  if (/مشروبات ساخنة/.test(t))            return "☕";

  /* ── Soft Drinks / Canned ───────────────────────────── */
  if (/يبسون|يبسي|pepsi/.test(t))         return "🥤";
  if (/كولا|cola/.test(t))                return "🥤";
  if (/مياه|water/.test(t))               return "💧";
  if (/مشروبات غازية|soda/.test(t))       return "🥤";
  if (/مشروبات باردة|cold drinks/.test(t)) return "🥤";
  if (/مشروبات|drinks/.test(t))           return "🥤";

  /* ── Extras / Condiments ────────────────────────────── */
  if (/صوص|sauce/.test(t))                return "🫙";
  if (/سكر|sugar/.test(t))                return "🍬";
  if (/إضافي|extra|add.?on/.test(t))      return "➕";

  /* ── Default ────────────────────────────────────────── */
  return "🥤";
}
