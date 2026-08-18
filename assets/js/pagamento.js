/* ============================================================================
   DETALZ — PIX de implantação
   BR Code estático (EMV QRCPS-MPM) + QR na página oculta /pagamento/.
   ========================================================================== */

(function () {
  'use strict';

  var PIX_KEY = '53095099000119';
  var MERCHANT_NAME = 'DETALZ';
  var MERCHANT_CITY = 'CAMPO BOM';

  var AUDIENCES = {
    marcenaria: {
      id: 'marcenaria',
      label: 'Marcenaria',
      amount: '3000.00',
      txid: 'MARCIMPL3000',
      description: 'Implantacao Marcenaria'
    },
    industria: {
      id: 'industria',
      label: 'Indústria',
      amount: null,
      txid: 'INDSOBMEDIDA',
      description: 'Projeto sob medida'
    },
    lojista: {
      id: 'lojista',
      label: 'Lojista',
      amount: '1200.00',
      txid: 'LOJAIMPL1200',
      description: 'Implantacao Lojista'
    }
  };

  function emv(id, value) {
    var len = String(value.length).padStart(2, '0');
    return id + len + value;
  }

  function crc16(payload) {
    var crc = 0xFFFF;
    var i;
    var bit;
    for (i = 0; i < payload.length; i += 1) {
      crc ^= payload.charCodeAt(i) << 8;
      for (bit = 0; bit < 8; bit += 1) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  function pixPayload(opts) {
    var merchant = emv('00', 'br.gov.bcb.pix') + emv('01', opts.key);
    if (opts.description) merchant += emv('02', opts.description);

    var additional = emv('05', opts.txid || '***');

    var payload = emv('00', '01');
    payload += emv('26', merchant);
    payload += emv('52', '0000');
    payload += emv('53', '986');
    if (opts.amount) payload += emv('54', opts.amount);
    payload += emv('58', 'BR');
    payload += emv('59', opts.name);
    payload += emv('60', opts.city);
    payload += emv('62', additional);
    payload += '6304';
    return payload + crc16(payload);
  }

  var qr = null;

  function renderQr(payload) {
    var frame = document.getElementById('payQr');
    if (!frame) return;
    frame.innerHTML = '';
    qr = null;

    if (typeof QRCode === 'undefined') {
      frame.innerHTML = '<p class="ds-meta" style="color:#0a0b0d;text-align:center">Copie o código Pix abaixo.</p>';
      return;
    }

    qr = new QRCode(frame, {
      text: payload,
      width: 232,
      height: 232,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  function setCopied(button, copied) {
    if (!button) return;
    button.textContent = copied ? 'Copiado' : 'Copiar';
    button.classList.toggle('is-copied', copied);
  }

  function selectAudience(id) {
    var audience = AUDIENCES[id];
    if (!audience) return;

    document.querySelectorAll('[data-pay-audience]').forEach(function (btn) {
      var on = btn.getAttribute('data-pay-audience') === id;
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    document.querySelectorAll('[data-pay-detail]').forEach(function (el) {
      el.hidden = el.getAttribute('data-pay-detail') !== id;
    });

    var panel = document.getElementById('payPanel');
    if (panel) panel.classList.add('is-open');

    var amountLabel = document.getElementById('payAmountLabel');
    if (amountLabel) {
      amountLabel.textContent = audience.amount
        ? 'R$ ' + Number(audience.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        : 'Digite o valor no app';
    }

    var hint = document.getElementById('payQrHint');
    if (hint) {
      hint.textContent = audience.amount
        ? 'Aponte a câmera do banco para este QR Code. Só a implantação entra neste Pix.'
        : 'Aponte a câmera do banco e digite no app o valor combinado agora.';
    }

    var payload = pixPayload({
      key: PIX_KEY,
      name: MERCHANT_NAME,
      city: MERCHANT_CITY,
      amount: audience.amount,
      txid: audience.txid,
      description: audience.description
    });

    var field = document.getElementById('payCopy');
    if (field) field.value = payload;

    var copyBtn = document.getElementById('payCopyBtn');
    setCopied(copyBtn, false);

    renderQr(payload);

    if (history.replaceState) {
      history.replaceState(null, '', '#' + id);
    } else {
      location.hash = id;
    }

    if (panel && window.matchMedia('(max-width: 899px)').matches) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function init() {
    document.querySelectorAll('[data-pay-audience]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectAudience(btn.getAttribute('data-pay-audience'));
      });
    });

    var copyBtn = document.getElementById('payCopyBtn');
    var field = document.getElementById('payCopy');
    if (copyBtn && field) {
      copyBtn.addEventListener('click', function () {
        var done = function () { setCopied(copyBtn, true); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(field.value).then(done).catch(function () {
            field.select();
            try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
          });
        } else {
          field.select();
          try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        }
      });
    }

    window.addEventListener('hashchange', function () {
      var id = location.hash.replace('#', '');
      if (AUDIENCES[id]) selectAudience(id);
    });

    var initial = location.hash.replace('#', '');
    if (AUDIENCES[initial]) selectAudience(initial);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
