/* 시안C 55차: 영문 문의 양식 — 서버로 보내지 않고 손님의 메일 앱을 연다(국문 js/contact.js 와 같은 방식). 설비를 고르면 맞는 분야를 보여 준다. */
(function () {
  var f = document.getElementById('enForm');
  if (!f) return;
  var fit = f.querySelector('.enC-fit'), msg = f.querySelector('.enC-msg');
  f.addEventListener('change', function (e) {
    if (e.target.name !== 'eq') return;
    fit.hidden = false; fit.querySelector('b').textContent = e.target.getAttribute('data-field');
  });
  document.querySelectorAll('.enC-copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy'), done = function () { var o = b.textContent; b.textContent = b.getAttribute('data-done'); setTimeout(function () { b.textContent = o; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () {}); else done();
    });
  });
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var g = function (n) { var x = f.elements[n]; return x ? String(x.value || '').trim() : ''; };
    var eq = f.querySelector('input[name=eq]:checked');
    var bad = !g('name') || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g('email'));
    var need = !eq && !g('body');
    if (bad || need) { msg.hidden = false; msg.textContent = f.getAttribute(bad ? 'data-req' : 'data-need'); return; }
    msg.hidden = true;
    var lines = [];
    if (eq) { lines.push('■ Equipment: ' + eq.getAttribute('data-t')); lines.push('■ Field: ' + eq.getAttribute('data-field')); }
    lines.push('■ Name / company: ' + g('name'));
    lines.push('■ Reply e-mail: ' + g('email'));
    if (g('tel')) lines.push('■ Phone: ' + g('tel'));
    lines.push('■ About the site:'); lines.push(g('body') || '-');
    var subj = f.getAttribute('data-subject').replace('{who}', g('name'));
    location.href = 'mailto:' + f.getAttribute('data-to') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n'));
  });
})();
