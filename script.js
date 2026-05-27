(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  const progress = document.getElementById('progress');
  const counter = document.getElementById('counter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const areaInput = document.getElementById('areaInput');
  const areaValue = document.getElementById('areaValue');
  const rangeMin = document.getElementById('rangeMin');
  const rangeMax = document.getElementById('rangeMax');
  const configGrid = document.getElementById('configGrid');
  const warehouseList = document.getElementById('warehouseList');
  const mapScene = document.getElementById('mapScene');
  const radiusLegend = document.getElementById('radiusLegend');

  const availableUnits = [3, 3.3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 20];

  const warehouses = [
    { name: 'Eixample — Carrer de Mallorca', distance: '0.8 км', units: '4 варианта', primary: true },
    { name: 'Gràcia — Travessera', distance: '2.1 км', units: '2 варианта', primary: false },
    { name: 'Poblenou — Av. Diagonal', distance: '4.5 км', units: '3 варианта', primary: false },
    { name: 'Sants — Pl. Espanya', distance: '6.2 км', units: '1 вариант', primary: false },
    { name: 'Sant Adrià', distance: '9.1 км', units: '2 варианта', primary: false },
  ];

  const mapPins = [
    { top: '42%', left: '48%', label: 'Eixample' },
    { top: '28%', left: '62%', label: 'Gràcia' },
    { top: '58%', left: '70%', label: 'Poblenou' },
    { top: '72%', left: '38%', label: 'Sants' },
    { top: '35%', left: '78%', label: 'Sant Adrià' },
  ];

  function showSlide(index) {
    current = ((index % total) + total) % total;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    progress.style.width = `${((current + 1) / total) * 100}%`;
    counter.textContent = `${current + 1} / ${total}`;
    if (current === 3) renderConfigs(getRequestedArea());
    if (current === 4) renderWarehouses();
    if (current === 5) renderMap();
  }

  function next() {
    showSlide(current + 1);
  }

  function prev() {
    showSlide(current - 1);
  }

  function getRequestedArea() {
    return Number(areaInput?.value || 15);
  }

  function updateRange() {
    const area = getRequestedArea();
    if (areaValue) areaValue.textContent = String(area);
    if (rangeMin) rangeMin.textContent = (area * 0.5).toFixed(1);
    if (rangeMax) rangeMax.textContent = (area * 1.5).toFixed(1);
    renderConfigs(area);
  }

  function generateConfigs(requestedArea) {
    const minArea = requestedArea * 0.5;
    const maxArea = requestedArea * 1.5;
    const seen = new Set();
    const configs = [];

    function add(units) {
      const totalArea = units.reduce((a, b) => a + b, 0);
      const key = units.slice().sort((a, b) => a - b).join('+');
      if (totalArea < minArea || totalArea > maxArea || seen.has(key)) return;
      seen.add(key);
      configs.push({ units: units.slice(), total: Math.round(totalArea * 10) / 10 });
    }

    for (const u of availableUnits) add([u]);

    for (let i = 0; i < availableUnits.length; i++) {
      for (let j = i; j < availableUnits.length; j++) {
        add([availableUnits[i], availableUnits[j]]);
      }
    }

    for (let i = 0; i < availableUnits.length; i++) {
      for (let j = i; j < availableUnits.length; j++) {
        for (let k = j; k < availableUnits.length; k++) {
          add([availableUnits[i], availableUnits[j], availableUnits[k]]);
        }
      }
    }

    return configs
      .sort((a, b) => Math.abs(a.total - requestedArea) - Math.abs(b.total - requestedArea))
      .slice(0, 6);
  }

  function renderConfigs(area) {
    if (!configGrid) return;
    const configs = generateConfigs(area);
    configGrid.innerHTML = configs
      .map((c, i) => {
        const isSingle = c.units.length === 1;
        const unitsStr = c.units.map((u) => `${u} м²`).join(' + ');
        return `
          <div class="config-card" style="animation-delay:${i * 0.08}s">
            <div class="total">${c.total} м²</div>
            <div class="units">${unitsStr}</div>
            <span class="tag">${isSingle ? 'Одно помещение' : 'Комбинация боксов'}</span>
          </div>`;
      })
      .join('');
  }

  function renderWarehouses() {
    if (!warehouseList || warehouseList.children.length) return;
    warehouseList.innerHTML = warehouses
      .map(
        (w, i) => `
        <div class="warehouse-row" style="animation-delay:${i * 0.1}s">
          <div>
            <div class="name">${w.name}${w.primary ? ' · у клиента' : ''}</div>
            <div class="meta">${w.distance} от точки запроса</div>
          </div>
          <div class="avail">${w.units}</div>
        </div>`
      )
      .join('');
  }

  function renderMap() {
    if (!mapScene || mapScene.querySelector('.map-pin')) return;
    mapPins.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'map-pin';
      el.style.top = p.top;
      el.style.left = p.left;
      el.dataset.label = p.label;
      el.style.animationDelay = `${0.2 + i * 0.15}s`;
      mapScene.appendChild(el);
    });
    if (radiusLegend) {
      radiusLegend.innerHTML = [
        'В точке запроса: 2 конфигурации',
        'В радиусе 10 км: ещё 8',
        'Лучшее совпадение: 15 м² (7 + 8)',
      ]
        .map((t) => `<span class="legend-chip">${t}</span>`)
        .join('');
    }
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 10000);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  prevBtn?.addEventListener('click', () => {
    prev();
    startAuto();
  });
  nextBtn?.addEventListener('click', () => {
    next();
    startAuto();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      next();
      startAuto();
    }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prev();
      startAuto();
    }
  });

  areaInput?.addEventListener('input', updateRange);

  document.getElementById('deck')?.addEventListener('mouseenter', stopAuto);
  document.getElementById('deck')?.addEventListener('mouseleave', startAuto);

  let touchStartX = 0;
  document.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  document.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) next();
      else prev();
      startAuto();
    },
    { passive: true }
  );

  updateRange();
  showSlide(0);
  startAuto();
})();
