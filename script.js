'use strict';
const $ = (s, r = document) => r.querySelector(s);

/* ===== Шапка: тінь при прокрутці ===== */
const hd = $('#hd');
addEventListener('scroll', () => hd.classList.toggle('s', scrollY > 10), { passive: true });
$('#y').textContent = new Date().getFullYear();

/* ===== «Зараз відчинено»: Пн–Сб 9:00–19:00 ===== */
(function () {
  const el = $('#open'), d = new Date(), day = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
  const isOpen = day >= 1 && day <= 6 && h >= 9 && h < 19;
  el.classList.toggle('on', isOpen);
  el.textContent = isOpen ? 'Зараз відчинено до 19:00' : (day === 6 && h >= 19) || day === 0 ? 'Зараз зачинено. Відчиняємось у понеділок о 9:00' : h < 9 && day >= 1 ? 'Зараз зачинено. Відчиняємось сьогодні о 9:00' : 'Зараз зачинено. Відчиняємось завтра о 9:00';
})();

/* ===== Прайс і розрахунок ===== */
const WORKS = [
  ['Комп’ютерна діагностика', 600],
  ['Діагностика ходової частини', 500],
  ['Діагностика електрики', 700],
  ['Заміна масла й масляного фільтра', 450],
  ['Заміна гальмівних колодок (вісь)', 900],
  ['Заміна гальмівних дисків (вісь)', 1200],
  ['Заміна амортизатора', 1100],
  ['Заміна свічок запалювання', 500],
  ['Заміна ременя ГРМ (комплект, робота)', 4500],
  ['Шиномонтаж R15–R17 (4 колеса)', 800],
  ['Балансування коліс (4 колеса)', 600],
  ['Заправка кондиціонера', 1200]
];
const fmt = n => Math.round(n).toLocaleString('uk-UA') + ' ₴';
const box = $('#works');
box.innerHTML = WORKS.map(([n, p], i) =>
  `<label class="work"><input type="checkbox" value="${i}"><span>${n}</span><b>${fmt(p)}</b></label>`).join('');

function calc() {
  const k = +document.querySelector('input[name=cls]:checked').value;
  const on = [...box.querySelectorAll('input:checked')].map(i => WORKS[+i.value]);
  const sum = on.reduce((s, w) => s + w[1], 0) * k;
  $('#total').textContent = fmt(sum);
  $('#count').textContent = on.length ? 'Вибрано робіт: ' + on.length : 'Нічого не вибрано';
  return { on, sum, k };
}
document.querySelector('.calc').addEventListener('change', calc);
calc();

$('#book').addEventListener('click', () => {
  const { on, sum } = calc();
  const cls = document.querySelector('input[name=cls]:checked').nextElementSibling.textContent;
  $('#m').value = on.length ? 'Потрібно: ' + on.map(w => w[0]).join('; ') + '. Тип авто: ' + cls + '. Орієнтовно ' + fmt(sum) + '.' : '';
  $('#contacts').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  setTimeout(() => $('#n').focus({ preventScroll: true }), 500);
});

/* ===== Маска телефону та форма запису ===== */
const ph = $('#p'), RE = /^\+380 \(\d{2}\) \d{3}-\d{2}-\d{2}$/;
let last = '';
const dig = v => { let d = v.replace(/\D/g, ''); if (d.startsWith('380')) d = d.slice(3); if (d.startsWith('0')) d = d.slice(1); return d.slice(0, 9); };
const mask = d => { let o = '+380 (' + d.slice(0, 2); if (d.length > 2) o += ') ' + d.slice(2, 5); if (d.length > 5) o += '-' + d.slice(5, 7); if (d.length > 7) o += '-' + d.slice(7, 9); return o; };
ph.addEventListener('focus', () => { if (!ph.value) ph.value = '+380 ('; });
ph.addEventListener('blur', () => { if (!dig(ph.value)) ph.value = ''; });
ph.addEventListener('input', e => {
  let d = dig(ph.value);
  if (e.inputType && e.inputType.startsWith('delete') && d === last) d = d.slice(0, -1);
  last = d; ph.value = mask(d);
});
$('#d').min = new Date().toISOString().slice(0, 10);

const form = $('#form');
const rules = {
  n: v => v.trim().length >= 2 || 'Вкажіть ім’я',
  p: v => RE.test(v.trim()) || 'Введіть повний номер телефону',
  c: v => v.trim().length >= 2 || 'Вкажіть марку й модель авто'
};
function check(f) {
  const r = rules[f.name](f.value), ok = r === true;
  f.setAttribute('aria-invalid', !ok);
  $('#e-' + f.name).textContent = ok ? '' : r;
  return ok;
}
form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid') === 'true') check(e.target); });
form.addEventListener('submit', e => {
  e.preventDefault();
  const bad = ['n', 'p', 'c'].map(k => form.elements[k]).filter(f => !check(f));
  if (bad.length) { bad[0].focus(); return; }
  /* Демо: реальної відправки немає. Для робочого сайту тут підключається fetch() на сервер або сервіс форм */
  $('#okT').textContent = 'Дякуємо, ' + form.elements.n.value.trim() + '!';
  form.hidden = true; $('#ok').hidden = false;
});
$('#again').addEventListener('click', () => {
  form.reset(); last = '';
  [...form.elements].forEach(f => f.removeAttribute('aria-invalid'));
  $('#ok').hidden = true; form.hidden = false; $('#n').focus();
});