// Slide transitions
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide) => {
    slide.classList.remove('active');
  });
  slides[index].classList.add('active');
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  }
});

let slideInterval = setInterval(nextSlide, 8000);

document.querySelector('.presentation').addEventListener('mouseenter', () => {
  clearInterval(slideInterval);
});

document.querySelector('.presentation').addEventListener('mouseleave', () => {
  slideInterval = setInterval(nextSlide, 8000);
});

showSlide(0);

function generateConfigs(requestedArea) {
  const minArea = requestedArea * 0.5;
  const maxArea = requestedArea * 1.5;
  const availableUnits = [3, 3.3, 4, 5, 6, 7, 8, 10, 12, 15, 20];
  const configs = [];

  availableUnits.forEach((unit) => {
    if (unit >= minArea && unit <= maxArea) {
      configs.push({ units: [unit], total: unit });
    }
  });

  for (let i = 0; i < availableUnits.length; i++) {
    for (let j = i; j < availableUnits.length; j++) {
      const total = availableUnits[i] + availableUnits[j];
      if (total >= minArea && total <= maxArea) {
        configs.push({ units: [availableUnits[i], availableUnits[j]], total });
      }
    }
  }

  for (let i = 0; i < availableUnits.length; i++) {
    for (let j = i; j < availableUnits.length; j++) {
      for (let k = j; k < availableUnits.length; k++) {
        const total = availableUnits[i] + availableUnits[j] + availableUnits[k];
        if (total >= minArea && total <= maxArea && total <= requestedArea * 1.3) {
          configs.push({ units: [availableUnits[i], availableUnits[j], availableUnits[k]], total });
        }
      }
    }
  }

  return configs
    .sort((a, b) => Math.abs(a.total - requestedArea) - Math.abs(b.total - requestedArea))
    .slice(0, 6);
}

function displayConfigs() {
  const configs = generateConfigs(15);
  const optionsContainer = document.querySelector('.options');
  if (!optionsContainer) return;

  optionsContainer.innerHTML = '';

  configs.forEach((config) => {
    const option = document.createElement('div');
    option.className = 'option';
    const unitsText = config.units.map((u) => `${u}m²`).join(' + ');
    option.innerHTML = `<strong>${config.total}m²</strong> — ${unitsText}`;
    optionsContainer.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', displayConfigs);
