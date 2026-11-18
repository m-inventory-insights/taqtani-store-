'use strict';

const PRODUCTS_KEY = 'taqtani_products_v1';
const FAV_KEY = 'taqtani_favorites_v1';

const DEFAULT_PRODUCTS = [
  { id:'cam-01', name:'كاميرا فورية بحالة ممتازة', category:'إلكترونيات', type:'sale', price:320, condition:'بحالة ممتازة', description:'كاميرا تصوير صغيرة مع ملحقاتها، مناسبة لتوثيق اللحظات وصناعة صور تذكارية. حالتها ممتازة والصور المعروضة للتوضيح ضمن المشروع.', image:'assets/images/camera.png', createdAt:5 },
  { id:'dress-02', name:'فستان مناسبات أنيق', category:'ملابس', type:'rent', price:90, condition:'شبه جديد', description:'فستان مناسبات أنيق بلون أخضر داكن وتفاصيل ناعمة. مثال تجريبي لعرض قطعة ملابس للإيجار والاستفادة منها عند الحاجة.', image:'assets/images/dress.png', createdAt:4 },
  { id:'books-03', name:'مجموعة كتب للقراءة', category:'كتب', type:'sale', price:55, condition:'مستعمل بحالة جيدة', description:'مجموعة كتب متنوعة يمكن أن تنتقل إلى قارئ جديد وتمنحه فرصة لاكتشاف أفكار ومعارف مختلفة.', image:'assets/images/books.png', createdAt:3 },
  { id:'chair-04', name:'كرسي مكتبي مريح', category:'أثاث', type:'sale', price:45, condition:'بحالة ممتازة', description:'كرسي أبيض بتصميم بسيط ومريح، يناسب زاوية العمل أو الدراسة. المعروض نموذج تجريبي ضمن منتجات الموقع.', image:'assets/images/chair.png', createdAt:2 },
  { id:'coffee-05', name:'آلة قهوة منزلية', category:'مستلزمات منزلية', type:'sale', price:180, condition:'شبه جديد', description:'آلة قهوة منزلية لتحضير القهوة بسهولة. مثال لمنتج منزلي يمكن إعادة استخدامه بدل تركه دون استفادة.', image:'assets/images/coffee.png', createdAt:1 }
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`تعذر قراءة ${key}`, error);
    return fallback;
  }
}
function getSavedProducts() { return readJSON(PRODUCTS_KEY, []); }
function getAllProducts() { return [...DEFAULT_PRODUCTS, ...getSavedProducts()]; }
function getFavorites() { return readJSON(FAV_KEY, []); }
function saveFavorites(items) { localStorage.setItem(FAV_KEY, JSON.stringify(items)); }
function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function formatPrice(value) {
  try { return new Intl.NumberFormat('ar-SA', { maximumFractionDigits:0 }).format(Number(value)); }
  catch { return String(value); }
}
function toast(message) {
  const region = document.querySelector('.toast-region');
  if (!region) return;
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 3600);
}
function productCard(product) {
  const isFavorite = getFavorites().includes(product.id);
  const image = product.image || 'assets/images/hero-shelf.png';
  const typeLabel = product.type === 'rent' ? 'للإيجار' : 'للبيع';
  const period = product.type === 'rent' && product.period ? ` / ${escapeHTML(product.period)}` : '';
  return `<article class="product-card">
    <div class="product-image-wrap"><img class="product-image" src="${escapeHTML(image)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.src='assets/images/hero-shelf.png'">
      <span class="offer-badge ${product.type === 'rent' ? 'rent' : ''}">${typeLabel}</span>
      <button class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" type="button" data-favorite="${escapeHTML(product.id)}" aria-label="${isFavorite ? 'إزالة من' : 'إضافة إلى'} المفضلة" aria-pressed="${isFavorite}">${isFavorite ? '♥' : '♡'}</button>
    </div>
    <div class="product-body"><div class="product-topline"><span class="product-category">${escapeHTML(product.category)}</span><span class="product-condition">${escapeHTML(product.condition || 'حالة جيدة')}</span></div>
      <h3 class="product-title">${escapeHTML(product.name)}</h3>
      <div class="product-meta"><span class="product-price">${formatPrice(product.price)} <small>ريال${period}</small></span><a class="product-card-link" href="product-details.html?id=${encodeURIComponent(product.id)}">التفاصيل ←</a></div>
    </div></article>`;
}
function bindFavoriteEvents(scope = document) {
  scope.querySelectorAll('[data-favorite]').forEach(button => {
    if (button.dataset.bound === 'yes') return;
    button.dataset.bound = 'yes';
    button.addEventListener('click', () => {
      const id = button.dataset.favorite;
      const favorites = getFavorites();
      const exists = favorites.includes(id);
      const next = exists ? favorites.filter(item => item !== id) : [...favorites, id];
      saveFavorites(next);
      button.classList.toggle('is-favorite', !exists);
      button.setAttribute('aria-pressed', String(!exists));
      button.setAttribute('aria-label', exists ? 'إضافة إلى المفضلة' : 'إزالة من المفضلة');
      button.textContent = exists ? '♡' : '♥';
      toast(exists ? 'تمت إزالة المنتج من المفضلة' : 'أضيف المنتج إلى المفضلة');
    });
  });
}
function renderProductGrids() {
  const homeGrid = document.getElementById('featured-grid');
  if (homeGrid) {
    const products = getAllProducts().slice(0, Number(homeGrid.dataset.limit || 3));
    homeGrid.innerHTML = products.map(productCard).join('');
    bindFavoriteEvents(homeGrid);
  }
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const search = document.getElementById('product-search');
  const category = document.getElementById('category-filter');
  const type = document.getElementById('type-filter');
  const sort = document.getElementById('sort-filter');
  const count = document.getElementById('results-count');
  const empty = document.getElementById('empty-state');
  const params = new URLSearchParams(window.location.search);
  if (params.has('category') && category) category.value = params.get('category');
  const render = () => {
    const q = (search?.value || '').trim().toLocaleLowerCase('ar');
    let products = getAllProducts().filter(product => {
      const haystack = `${product.name} ${product.category} ${product.description || ''}`.toLocaleLowerCase('ar');
      return (!q || haystack.includes(q)) && (!category.value || product.category === category.value) && (!type.value || product.type === type.value);
    });
    const sortValue = sort?.value || 'newest';
    if (sortValue === 'price-low') products.sort((a,b) => Number(a.price)-Number(b.price));
    else if (sortValue === 'price-high') products.sort((a,b) => Number(b.price)-Number(a.price));
    else if (sortValue === 'name') products.sort((a,b) => a.name.localeCompare(b.name,'ar'));
    else products.sort((a,b) => Number(b.createdAt || 0)-Number(a.createdAt || 0));
    grid.innerHTML = products.map(productCard).join('');
    bindFavoriteEvents(grid);
    if (count) count.textContent = `${formatPrice(products.length)} ${products.length === 1 ? 'عرض' : 'عروض'} متاحة`;
    if (empty) empty.hidden = products.length !== 0;
    grid.hidden = products.length === 0;
  };
  [search, category, type, sort].filter(Boolean).forEach(control => control.addEventListener(control === search ? 'input' : 'change', render));
  const clear = () => { if(search) search.value=''; if(category) category.value=''; if(type) type.value=''; if(sort) sort.value='newest'; render(); };
  document.getElementById('clear-filters')?.addEventListener('click', clear);
  document.getElementById('empty-reset')?.addEventListener('click', clear);
  render();
}
function renderProductDetail() {
  const mount = document.getElementById('product-detail');
  if (!mount) return;
  const id = new URLSearchParams(window.location.search).get('id');
  const product = getAllProducts().find(item => item.id === id);
  if (!product) {
    mount.innerHTML = `<div class="loading-state"><h2>لم نعثر على هذا المنتج</h2><p>قد يكون الرابط غير صحيح أو أن العرض لم يعد موجودًا في هذا المتصفح.</p><a class="btn btn-primary" href="products.html">العودة إلى المنتجات</a></div>`;
    return;
  }
  const isFavorite = getFavorites().includes(product.id);
  const typeLabel = product.type === 'rent' ? 'للإيجار' : 'للبيع';
  const period = product.type === 'rent' && product.period ? ` / ${escapeHTML(product.period)}` : '';
  const contactAction = product.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(product.contactEmail)
    ? `<a class="btn btn-outline" href="mailto:${escapeHTML(product.contactEmail)}?subject=${encodeURIComponent('استفسار عن '+product.name)}">تواصلي عبر البريد</a>`
    : `<a class="btn btn-outline" href="mailto:contact@example.com?subject=${encodeURIComponent('استفسار عن '+product.name)}">تواصلي مع فريق تقتني</a>`;
  mount.innerHTML = `<div class="detail-image-box"><img src="${escapeHTML(product.image || 'assets/images/hero-shelf.png')}" alt="${escapeHTML(product.name)}" onerror="this.src='assets/images/hero-shelf.png'"></div>
  <div class="detail-info"><div class="product-topline"><span class="offer-badge ${product.type === 'rent' ? 'rent' : ''}">${typeLabel}</span><span class="product-category">${escapeHTML(product.category)}</span></div><h1>${escapeHTML(product.name)}</h1><p>${escapeHTML(product.description || 'عرض تجريبي على منصة تقتني.')}</p><div class="detail-price">${formatPrice(product.price)} <small>ريال${period}</small></div><div class="detail-specs"><div><small>حالة المنتج</small><strong>${escapeHTML(product.condition || 'بحالة جيدة')}</strong></div><div><small>نوع العرض</small><strong>${typeLabel}</strong></div><div><small>الفئة</small><strong>${escapeHTML(product.category)}</strong></div><div><small>رقم العرض</small><strong>${escapeHTML(product.id)}</strong></div></div><div class="detail-actions">${contactAction}<button class="btn btn-light favorite-btn-detail" type="button" data-favorite="${escapeHTML(product.id)}" aria-pressed="${isFavorite}">${isFavorite ? '♥ ضمن المفضلة' : '♡ أضيفي للمفضلة'}</button></div></div>`;
  bindFavoriteEvents(mount);
}
function setupMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false');
  }));
}
function setupYearAndDate() {
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  document.querySelectorAll('[data-today]').forEach(el => {
    el.textContent = new Intl.DateTimeFormat('ar', { dateStyle:'full' }).format(new Date());
  });
}
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('صيغة الصورة غير مدعومة'));
      image.onload = () => {
        const maxSide = 1100;
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('تعذر معالجة الصورة'));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function setupAddProductForm() {
  const form = document.getElementById('add-product-form');
  if (!form) return;
  const type = document.getElementById('product-type');
  const periodGroup = document.getElementById('rental-period-group');
  const period = document.getElementById('rental-period');
  const file = document.getElementById('product-image');
  const preview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const remove = document.getElementById('remove-image');
  let imageData = '';
  const updatePeriod = () => {
    const renting = type.value === 'rent';
    periodGroup.hidden = !renting;
    period.required = renting;
    if (!renting) period.value = '';
  };
  type.addEventListener('change', updatePeriod);
  file.addEventListener('change', async () => {
    const selected = file.files?.[0];
    imageData = '';
    preview.hidden = true;
    if (!selected) return;
    if (!selected.type.startsWith('image/')) { toast('اختاري ملف صورة فقط'); file.value=''; return; }
    if (selected.size > 4 * 1024 * 1024) { toast('حجم الصورة أكبر من 4 ميجابايت'); file.value=''; return; }
    try {
      imageData = await compressImage(selected);
      previewImg.src = imageData;
      preview.hidden = false;
    } catch (error) { toast(error.message); file.value=''; }
  });
  remove.addEventListener('click', () => { imageData=''; file.value=''; preview.hidden=true; previewImg.removeAttribute('src'); });
  form.addEventListener('reset', () => { window.setTimeout(() => { imageData=''; preview.hidden=true; previewImg.removeAttribute('src'); updatePeriod(); },0); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const price = Number(data.get('price'));
    if (!Number.isFinite(price) || price <= 0) { document.getElementById('product-price').setCustomValidity('أدخلي سعرًا أكبر من صفر'); document.getElementById('product-price').reportValidity(); document.getElementById('product-price').addEventListener('input', e => e.target.setCustomValidity(''), { once:true }); return; }
    if (data.get('type') === 'rent' && !data.get('period')) { period.setCustomValidity('اختاري فترة الإيجار'); period.reportValidity(); period.addEventListener('change', () => period.setCustomValidity(''), { once:true }); return; }
    const item = {
      id:`user-${Date.now()}`,
      name:String(data.get('name')).trim(), category:String(data.get('category')),
      description:String(data.get('description')).trim(), condition:String(data.get('condition')),
      type:String(data.get('type')), price, period:String(data.get('period') || ''),
      contactName:String(data.get('contactName') || '').trim(), contactEmail:String(data.get('contactEmail') || '').trim(),
      image:imageData || 'assets/images/hero-shelf.png', createdAt:Date.now()
    };
    try {
      const saved = getSavedProducts();
      saved.unshift(item);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(saved));
      toast('تم حفظ العرض في هذا المتصفح بنجاح');
      form.reset();
      window.setTimeout(() => { window.location.href = `product-details.html?id=${encodeURIComponent(item.id)}`; }, 1100);
    } catch (error) {
      toast('تعذر الحفظ. قد تكون مساحة التخزين ممتلئة؛ جربي صورة أصغر.');
      console.error(error);
    }
  });
  updatePeriod();
}
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    toast('شكرًا لرسالتك. هذا تأكيد تجريبي ولم تُرسل الرسالة.');
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupYearAndDate();
  renderProductGrids();
  renderProductDetail();
  setupAddProductForm();
  setupContactForm();
});
