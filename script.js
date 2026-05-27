// Slide transitions
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
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

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});

// Auto-advance every 8 seconds
let slideInterval = setInterval(nextSlide, 8000);

// Pause on hover (for demo)
document.querySelector('.presentation').addEventListener('mouseenter', () => {
  clearInterval(slideInterval);
});

document.querySelector('.presentation').addEventListener('mouseleave', () => {
  slideInterval = setInterval(nextSlide, 8000);
});

// Initialize
showSlide(0);

// Dynamic config generator
function generateConfigs(requestedArea) {
  const minArea = requestedArea * 0.5;
  const maxArea = requestedArea * 1.5;
  
  // Mock available units (in real app, this would come from API)
  const availableUnits = [3, 3.3, 4, 5, 6, 7, 8, 10, 12, 15, 20];
  
  const configs = [];
  
  // Single unit match
  availableUnits.forEach(unit => {
    if (unit >= minArea && unit <= maxArea) {
      configs.push({
        type: 'single',
        units: [unit],
        total: unit
      });
    }
  });
  
  // Two-unit combinations
  for (let i = 0; i < availableUnits.length; i++) {
    for (let j = i; j < availableUnits.length; j++) {
      const total = availableUnits[i] + availableUnits[j];
      if (total >= minArea && total <= maxArea) {
        configs.push({
          type: 'combo',
          units: [availableUnits[i], availableUnits[j]],
          total: total
        });
      }
    }
  }
  
  // Three-unit combinations (simplified)
  for (let i = 0; i < availableUnits.length; i++) {
    for (let j = i; j < availableUnits.length; j++) {
      for (let k = j; k < availableUnits.length; k++) {
        const total = availableUnits[i] + availableUnits[j] + availableUnits[k];
        if (total >= minArea && total <= maxArea && total <= requestedArea * 1.3) {
          configs.push({
            type: 'combo',
            units: [availableUnits[i], availableUnits[j], availableUnits[k]],
            total: total
          });
        }
      }
    }
  }
  
  // Sort by closeness to requested area
  return configs.sort((a, b) => {
    const diffA = Math.abs(a.total - requestedArea);
    const diffB = Math.abs(b.total - requestedArea);
    return diffA - diffB;
  }).slice(0, 6); // Top 6 options
}

// Display configs on solution slide
function displayConfigs() {
  const configs = generateConfigs(15);
  const optionsContainer = document.querySelector('.options');
  
  if (!optionsContainer) return;
  
  optionsContainer.innerHTML = '';
  
  configs.forEach(config => {
    const option = document.createElement('div');
    option.className = 'option';
    
    const unitsText = config.units.map(u => `${u}m²`).join(' + ');
    option.innerHTML = `<strong>${config.total}m²</strong> — ${unitsText}`;
    optionsContainer.appendChild(option);
  });
}

// Call displayConfigs on page load
document.addEventListener('DOMContentLoaded', displayConfigs);