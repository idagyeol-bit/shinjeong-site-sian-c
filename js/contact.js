/* ============================================================
   현장 문의 — 입력 확인 후 방문자의 메일 앱을 여는 방식
   ※ 접수 서버가 없습니다. 홈페이지가 메일을 대신 보내거나 저장하지 않습니다.
      접수 서버(또는 폼 서비스)를 붙이려면 README의 안내를 보세요.
   ============================================================ */
(function () {
  'use strict';

  var MAIL = 'shinjeong@sjdevel.com';
  var MAILTO_LIMIT = 1800; // 주소가 너무 길면 메일 앱이 본문을 자르므로 복사로 안내한다

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('inquiryForm');
    if (!form) return;

    var out = document.getElementById('formMsg');
    var box = document.getElementById('copyBox');
    var boxWrap = document.getElementById('copyWrap');

    /* 주소로 넘어온 맥락(#/contact?service=S04 형태)을 업무 선택에 반영 */
    var presetTitle = '';
    (function preset() {
      var params = new URLSearchParams(window.location.search);
      var v = params.get('service');
      if (!v && window.location.hash.indexOf('?') !== -1) {
        v = new URLSearchParams(window.location.hash.split('?')[1]).get('service');
      }
      if (!v) return;
      var sel = form.querySelector('[name="service"]');
      if (sel) {
        var opt = sel.querySelector('option[value="' + v.replace(/"/g, '') + '"]');
        if (opt) sel.value = opt.value;
        return;
      }
      /* 2026-11-01: 업무 선택 칸이 없는 양식(시안B 33차 슬림)에서는 문의 내용 첫 줄과 메일 제목에 업무 이름을 넣는다 */
      var map = {};
      try { map = JSON.parse(form.getAttribute('data-svc') || '{}'); } catch (err) { map = {}; }
      var body = form.querySelector('[name="body"]');
      if (!map[v] || !body) return;
      presetTitle = map[v];
      if (!body.value.trim()) body.value = '문의 업무: ' + presetTitle + '\n';
    })();

    function setBad(field, bad, msg) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.toggle('is-bad', bad);
      var err = wrap.querySelector('.field__err');
      if (err) {
        err.textContent = bad ? msg : '';
        err.hidden = !bad;
      }
      field.setAttribute('aria-invalid', String(bad));
    }

    function validate() {
      var bad = null;

      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var body = form.querySelector('[name="body"]');

      var nameBad = !name.value.trim();
      setBad(name, nameBad, '이름 또는 회사명을 입력해 주세요.');
      if (nameBad && !bad) bad = name;

      var emailVal = email.value.trim();
      var emailBad = !emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal);
      setBad(email, emailBad, emailVal ? '이메일 주소 형식을 확인해 주세요.' : '회신받으실 이메일을 입력해 주세요.');
      if (emailBad && !bad) bad = email;

      var picked = form.querySelector('[name="service"]'); picked = picked && picked.value;   // 52차: 설비를 골랐으면 현장 상황은 선택
      var bodyBad = !picked && body.value.replace(/^문의 업무: .*\n?/, '').trim().length < 5;   // 미리 채운 업무 줄만 있으면 아직 안 쓴 것으로 본다
      setBad(body, bodyBad, '설비를 고르시거나, 현장 상황을 조금 적어 주세요.');
      if (bodyBad && !bad) bad = body;

      return bad;
    }

    function compose() {
      var get = function (n) {
        var el = form.querySelector('[name="' + n + '"]');
        if (!el) return '';
        if (el.tagName === 'SELECT') {
          var o = el.options[el.selectedIndex];
          return o && o.value ? o.textContent.trim() : '';
        }
        return el.value.trim();
      };

      var has = function (n) { return !!form.querySelector('[name="' + n + '"]'); };   // 시안B 33차: 양식에 없는 칸(문의 업무·대상 설비·현장 위치)은 메일 본문에서도 뺀다
      var service = get('service') || presetTitle;
      var subject = '[현장 문의] ' + (service || '문의') + ' — ' + get('name');

      var lines = [
        '■ 이름 / 회사명: ' + get('name'),
        '■ 회신 이메일: ' + get('email'),
        '■ 연락처: ' + (get('phone') || '-'),
        has('service') ? '■ 문의 업무: ' + (service || '-') : null,
        has('target') ? '■ 대상 설비: ' + (get('target') || '-') : null,
        has('place') ? '■ 현장 위치: ' + (get('place') || '-') : null,
        has('cond') ? '■ 현장 조건: ' + (get('cond') || '-') : null,   // 52차
        '■ 희망 일정: ' + (get('when') || '-'),
        '',
        '■ 현장 상황',
        get('body') || '-',
        '',
        '— 신정개발 홈페이지 문의 양식에서 작성'
      ].filter(function (l) { return l !== null; });

      return { subject: subject, text: lines.join('\n') };
    }

    function say(msg) {
      if (out) out.textContent = msg;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var bad = validate();
      if (bad) {
        say('입력하지 않은 항목이 있습니다. 표시된 곳을 확인해 주세요.');
        bad.focus();
        return;
      }

      var m = compose();
      var href = 'mailto:' + MAIL +
        '?subject=' + encodeURIComponent(m.subject) +
        '&body=' + encodeURIComponent(m.text);

      if (box) box.textContent = '받는 사람: ' + MAIL + '\n제목: ' + m.subject + '\n\n' + m.text;

      if (href.length > MAILTO_LIMIT) {
        if (boxWrap) boxWrap.hidden = false;
        say('문의 내용이 길어 메일 앱으로 바로 넘기지 못했습니다. 아래 내용을 복사해 ' + MAIL + ' 으로 보내 주세요.');
        if (box) box.focus && box.focus();
        return;
      }

      if (boxWrap) boxWrap.hidden = false;
      say('메일 앱을 열었습니다. 창이 열리지 않으면 아래 내용을 복사해 ' + MAIL + ' 으로 보내 주세요.');
      window.location.href = href;
    });

    /* 복사 버튼 */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-copy]');
      if (!btn) return;
      e.preventDefault();

      var what = btn.getAttribute('data-copy');
      var text = what === 'mail' ? MAIL : (box ? box.textContent : '');
      if (!text) {
        say('복사할 내용이 아직 없습니다. 먼저 [메일로 문의 보내기]를 눌러 주세요.');
        return;
      }

      var done = function () {
        var old = btn.textContent;
        btn.textContent = '복사했습니다';
        setTimeout(function () { btn.textContent = old; }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          say('자동 복사가 되지 않았습니다. 내용을 직접 선택해 복사해 주세요.');
        });
      } else {
        say('자동 복사가 되지 않았습니다. 내용을 직접 선택해 복사해 주세요.');
      }
    });
  });
})();


/* 시안C 52차: 문의 남기기 — 설비를 고르면 맞는 분야 · 투입 장비가 바로 보이고(방폭지역이면 유압 구동 한 줄), 고른 것은 숨은 칸(service · target · cond · when)에 담겨 메일에 들어간다 */
(function () {
  var form = document.getElementById('inquiryForm'); if (!form || !form.querySelector('[name="cq-eq"]')) return;
  var fit = form.querySelector('.cq-fit'), ex = form.querySelector('.cq-fit__ex');
  var map = {}; try { map = JSON.parse(form.getAttribute('data-svc') || '{}'); } catch (e) {}
  var put = function (n, v) { var el = form.querySelector('input[type="hidden"][name="' + n + '"]'); if (el) el.value = v; };
  function upd() {
    var eq = form.querySelector('[name="cq-eq"]:checked'), svc = eq ? eq.value : '';
    fit.hidden = !svc; [].forEach.call(fit.querySelectorAll('[data-svc]'), function (p) { p.hidden = p.dataset.svc !== svc; });
    var cs = [].map.call(form.querySelectorAll('[name="cq-c"]:checked'), function (c) { return c.value; });
    ex.hidden = !((svc === 'S01' || svc === 'S02') && cs.indexOf('방폭지역') > -1);
    var w = form.querySelector('[name="cq-when"]:checked');
    put('service', map[svc] || ''); put('target', eq ? eq.dataset.t : ''); put('cond', cs.join(', ')); put('when', w ? (w.value || '미정') : '');
    if (svc) { var b = form.querySelector('[name="body"]'); var wrap = b && b.closest('.field'); if (wrap && wrap.classList.contains('is-bad')) { wrap.classList.remove('is-bad'); var er = wrap.querySelector('.field__err'); if (er) er.hidden = true; } }
  }
  form.addEventListener('change', upd);
  /* 주소로 넘어온 분야(?service=S0x) — 그 분야의 첫 설비를 골라 둔다 */
  var v = new URLSearchParams(location.search).get('service');
  if (v) { var r = form.querySelector('[name="cq-eq"][value="' + v.replace(/"/g, '') + '"]'); if (r) r.checked = true; var b = form.querySelector('[name="body"]'); if (b && /^문의 업무: /.test(b.value)) b.value = ''; }
  upd();
})();
