// EcoTrace SPA Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    activeTab: 'dashboard',
    calcStep: 1,
    activeHabits: new Set(), // Set of habit IDs
    habitsData: [],
    footprintData: {
      energy: 0,        // metric tons CO2/yr
      transportation: 0,
      food: 0,
      waste: 0,
      totalCO2: 0       // metric tons CO2/yr
    },
    historyLogs: []
  };

  // DOM Elements
  const tabs = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const stepDots = document.querySelectorAll('.step-dot');
  const calcSteps = document.querySelectorAll('.calc-step');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnSaveLog = document.getElementById('btn-save-log');

  // Dashboard elements
  const kpiTotalEl = document.getElementById('kpi-total');
  const kpiSavingsEl = document.getElementById('kpi-savings');
  const kpiTreesEl = document.getElementById('kpi-trees');
  const kpiComparisonEl = document.getElementById('kpi-comparison');
  const logsTbodyEl = document.getElementById('logs-tbody');
  const insightsContainerEl = document.getElementById('insights-container');
  const habitsContainerEl = document.getElementById('habits-container');

  // Chart instance reference
  let emissionsChart = null;

  // Initialize
  initApp();

  // --- Core Initialization ---
  async function initApp() {
    setupTabNavigation();
    setupCalculatorWizard();

    // Load local storage fallback first (instant load)
    loadLocalStorageData();

    // Fetch configuration from API
    await fetchHabits();
    await fetchFootprintLogs();

    // Render initial states
    renderDashboard();
    renderHabitsGrid();
  }

  // --- Navigation & Routing ---
  function setupTabNavigation() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });
  }

  function switchTab(tabId) {
    state.activeTab = tabId;

    tabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    // Specific tab loads
    if (tabId === 'dashboard') {
      renderDashboard();
    }
  }

  // --- Calculator Wizard logic ---
  function setupCalculatorWizard() {
    btnNext.addEventListener('click', () => {
      if (state.calcStep < 5) {
        if (validateStep(state.calcStep)) {
          state.calcStep++;
          updateCalculatorUI();
        }
      } else {
        // Calculation finished, reset and switch to dashboard
        resetCalculator();
        switchTab('dashboard');
      }
    });

    btnPrev.addEventListener('click', () => {
      if (state.calcStep > 1) {
        state.calcStep--;
        updateCalculatorUI();
      }
    });

    btnSaveLog.addEventListener('click', saveCurrentCalculations);
  }

  function validateStep(step) {
    // Basic inputs validation if needed, all default to 0 so we allow empty
    return true;
  }

  function updateCalculatorUI() {
    // Update step visibility
    calcSteps.forEach(stepEl => {
      const stepNum = parseInt(stepEl.getAttribute('data-step'));
      if (stepNum === state.calcStep) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    });

    // Update dots
    stepDots.forEach(dot => {
      const dotNum = parseInt(dot.getAttribute('data-step'));
      dot.className = 'step-dot';
      if (dotNum === state.calcStep) {
        dot.classList.add('active');
      } else if (dotNum < state.calcStep) {
        dot.classList.add('completed');
        dot.innerHTML = '✓';
      } else {
        dot.innerHTML = dotNum;
      }
    });

    // Prev Button visibility
    if (state.calcStep === 1) {
      btnPrev.style.visibility = 'hidden';
    } else {
      btnPrev.style.visibility = 'visible';
    }

    // Next Button text
    if (state.calcStep === 4) {
      btnNext.innerHTML = 'Calculate <i data-lucide="calculator"></i>';
      lucide.createIcons();
    } else if (state.calcStep === 5) {
      btnPrev.style.visibility = 'hidden';
      btnNext.innerHTML = 'View Dashboard <i data-lucide="arrow-right"></i>';
      lucide.createIcons();
      computeCalculations();
    } else {
      btnNext.innerHTML = 'Next <i data-lucide="arrow-right"></i>';
      lucide.createIcons();
    }
  }

  function resetCalculator() {
    state.calcStep = 1;
    document.getElementById('calculator-form').reset();
    updateCalculatorUI();
  }

  // --- Calculations logic ---
  function computeCalculations() {
    const resultsLoading = document.getElementById('results-loading');
    const resultsDisplay = document.getElementById('results-display');

    resultsLoading.style.display = 'block';
    resultsDisplay.style.display = 'none';

    setTimeout(() => {
      // Step 1: Energy Inputs (monthly)
      const electricity = parseFloat(document.getElementById('energy-electricity').value) || 0;
      const gas = parseFloat(document.getElementById('energy-gas').value) || 0;
      const oil = parseFloat(document.getElementById('energy-oil').value) || 0;

      // Step 2: Transportation Inputs
      const carMiles = parseFloat(document.getElementById('transport-car-miles').value) || 0;
      const carMPG = parseFloat(document.getElementById('transport-car-mpg').value) || 25;
      const evMiles = parseFloat(document.getElementById('transport-ev-miles').value) || 0;
      const transitMiles = parseFloat(document.getElementById('transport-transit-miles').value) || 0;
      const flightHours = parseFloat(document.getElementById('transport-flight-hours').value) || 0;

      // Step 3: Food Inputs
      const diet = document.getElementById('food-diet').value;

      // Step 4: Waste Inputs
      const recycling = parseFloat(document.getElementById('waste-recycling').value) || 0.2;

      // Calculate Energy Emissions (annual tons)
      // Electricity: kWh/mo * 0.37 kg/kWh * 12 mo / 1000 kg
      const energyElectricityCO2 = (electricity * 0.37 * 12) / 1000;
      // Gas: therms/mo * 5.3 kg/therm * 12 mo / 1000 kg
      const energyGasCO2 = (gas * 5.3 * 12) / 1000;
      // Heating Oil: gal/mo * 10.15 kg/gal * 12 mo / 1000 kg
      const energyOilCO2 = (oil * 10.15 * 12) / 1000;
      const totalEnergyCO2 = energyElectricityCO2 + energyGasCO2 + energyOilCO2;

      // Calculate Transportation Emissions (annual tons)
      // Petrol vehicle: miles/yr / MPG * 8.88 kg/gal / 1000 = miles * 0.404 / MPG / 1000 (roughly)
      // We will use standard EPA: miles/yr / MPG * 8.887 kg CO2 / 1000
      const carCO2 = carMPG > 0 ? (carMiles / carMPG) * 8.887 / 1000 : 0;
      // EV: miles/yr * 0.11 kg/mile / 1000
      const evCO2 = (evMiles * 0.11) / 1000;
      // Public transit: miles/wk * 52 wk * 0.09 kg/mile / 1000
      const transitCO2 = (transitMiles * 52 * 0.09) / 1000;
      // Flight hours: flight_hours * 90 kg/hr / 1000
      const flightCO2 = (flightHours * 90) / 1000;
      const totalTransportCO2 = carCO2 + evCO2 + transitCO2 + flightCO2;

      // Calculate Food Emissions (annual tons)
      let foodCO2 = 2.5; // Medium meat default
      if (diet === 'heavy-meat') foodCO2 = 3.3;
      if (diet === 'low-meat') foodCO2 = 2.1;
      if (diet === 'vegetarian') foodCO2 = 1.7;
      if (diet === 'vegan') foodCO2 = 1.5;

      // Calculate Waste & Consumption (annual tons)
      // Base waste is 0.7 t/yr, reduced by recycling rate
      const wasteCO2 = 0.7 * (1 - recycling);

      // Total Carbon Footprint
      const totalCO2 = totalEnergyCO2 + totalTransportCO2 + foodCO2 + wasteCO2;

      // Save calculated data to local temp state
      state.footprintData = {
        energy: parseFloat(totalEnergyCO2.toFixed(2)),
        transportation: parseFloat(totalTransportCO2.toFixed(2)),
        food: parseFloat(foodCO2.toFixed(2)),
        waste: parseFloat(wasteCO2.toFixed(2)),
        totalCO2: parseFloat(totalCO2.toFixed(2))
      };

      // Display Calculations
      document.getElementById('results-total-co2').innerText = state.footprintData.totalCO2.toFixed(2);
      document.getElementById('res-energy').innerText = state.footprintData.energy.toFixed(2) + ' t';
      document.getElementById('res-transport').innerText = state.footprintData.transportation.toFixed(2) + ' t';
      document.getElementById('res-food').innerText = state.footprintData.food.toFixed(2) + ' t';
      document.getElementById('res-waste').innerText = state.footprintData.waste.toFixed(2) + ' t';

      resultsLoading.style.display = 'none';
      resultsDisplay.style.display = 'block';
    }, 600);
  }

  async function saveCurrentCalculations() {
    try {
      const response = await fetch('/api/footprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...state.footprintData,
          timestamp: new Date().toISOString()
        })
      });

      let savedData;
      if (response.ok) {
        console.log("Response Status:", response.status);

        const data = await response.json();

        console.log("Response Data:", data);
        savedData = json.data;
      } else {
        // Mock fallback if API fails
        savedData = {
          id: Date.now().toString(),
          ...state.footprintData,
          timestamp: new Date().toISOString()
        };
      }

      chatBox.innerHTML += `<p><b>Eco AI:</b> ${data.response}</p>`;

      // Add to local state history
      state.historyLogs.unshift(savedData);

      // Keep up to 10 logs in local storage
      if (state.historyLogs.length > 10) state.historyLogs.pop();

      // Save data back to localStorage for persistence
      localStorage.setItem('ecotrace_footprint', JSON.stringify(state.footprintData));
      localStorage.setItem('ecotrace_logs', JSON.stringify(state.historyLogs));

      // Visual feedback and redirect
      btnSaveLog.innerHTML = 'Saved successfully! <i data-lucide="check"></i>';
      btnSaveLog.style.background = 'var(--color-emerald)';
      lucide.createIcons();

      setTimeout(() => {
        btnSaveLog.innerHTML = '<i data-lucide="save"></i> Save Calculation to History & Dashboard';
        btnSaveLog.style.background = '';
        lucide.createIcons();
        resetCalculator();
        switchTab('dashboard');
      }, 1000);

    } catch (e) {
      console.error('Error saving footprint:', e);
    }
  }

  // --- APIs Fetching ---
  async function fetchHabits() {
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        state.habitsData = await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch habits, using static fallback:', err);
    }

    // Fallback static habits list if API fails
    if (!state.habitsData || state.habitsData.length === 0) {
      state.habitsData = [
        { id: 'meatless_monday', name: 'Meatless Mondays', category: 'Food', co2Savings: 400, description: 'Avoid meat once a week to lower agricultural impact.', icon: 'utensils' },
        { id: 'led_upgrade', name: 'Upgrade to LED Bulbs', category: 'Energy', co2Savings: 150, description: 'Replace incandescent lighting with energy-efficient LEDs.', icon: 'lightbulb' },
        { id: 'bike_commute', name: 'Bike/Walk to Work', category: 'Transportation', co2Savings: 900, description: 'Walk or bike instead of driving for your daily commute.', icon: 'bike' },
        { id: 'cold_wash', name: 'Wash Laundry in Cold Water', category: 'Energy', co2Savings: 75, description: 'Use cold water cycles for washing clothes.', icon: 'droplets' },
        { id: 'smart_thermostat', name: 'Install Smart Thermostat', category: 'Energy', co2Savings: 320, description: 'Automate heating and cooling to reduce wasted energy.', icon: 'thermometer' },
        { id: 'composting', name: 'Compost Organic Waste', category: 'Waste', co2Savings: 120, description: 'Divert organic waste from landfills to reduce methane.', icon: 'leaf' },
        { id: 'reduce_flights', name: 'One Less Short-Haul Flight', category: 'Transportation', co2Savings: 180, description: 'Substitute one short-haul flight with train travel or video call.', icon: 'plane' },
        { id: 'line_dry', name: 'Line Dry Clothes', category: 'Energy', co2Savings: 200, description: 'Air dry clothes instead of using a high-energy clothes dryer.', icon: 'wind' }
      ];
    }
  }

  async function fetchFootprintLogs() {
    try {
      const res = await fetch('/api/footprint');
      if (res.ok) {
        const logs = await res.json();
        if (logs && logs.length > 0) {
          state.historyLogs = logs;
          localStorage.setItem('ecotrace_logs', JSON.stringify(logs));
        }
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }

  function loadLocalStorageData() {
    const localFootprint = localStorage.getItem('ecotrace_footprint');
    const localLogs = localStorage.getItem('ecotrace_logs');
    const localHabits = localStorage.getItem('ecotrace_habits');

    if (localFootprint) {
      state.footprintData = JSON.parse(localFootprint);
    } else {
      // Default placeholder data for first-time visitors
      state.footprintData = {
        energy: 4.2,
        transportation: 5.5,
        food: 2.5,
        waste: 0.5,
        totalCO2: 12.7
      };
    }

    if (localLogs) {
      state.historyLogs = JSON.parse(localLogs);
    } else {
      // Initialize with a default seed log
      state.historyLogs = [
        {
          id: 'initial_seed',
          energy: 4.2,
          transportation: 5.5,
          food: 2.5,
          waste: 0.5,
          totalCO2: 12.7,
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
        }
      ];
    }

    if (localHabits) {
      state.activeHabits = new Set(JSON.parse(localHabits));
    }
  }

  // --- Rendering UI Panels ---
  function renderDashboard() {
    // 1. Calculate Habit Savings (CO2 savings are in kg, convert to annual metric tons)
    let totalSavingsKg = 0;
    state.activeHabits.forEach(habitId => {
      const habit = state.habitsData.find(h => h.id === habitId);
      if (habit) {
        totalSavingsKg += habit.co2Savings;
      }
    });
    const totalSavingsTons = totalSavingsKg / 1000;

    // 2. Adjust Dashboard calculations
    const originalFootprint = state.footprintData.totalCO2;
    const currentFootprint = Math.max(0, originalFootprint - totalSavingsTons);

    // Update KPIs
    kpiTotalEl.innerText = currentFootprint.toFixed(1);
    kpiSavingsEl.innerText = totalSavingsTons.toFixed(2);

    // Offset Equivalent: Trees needed (approx 50 trees absorb 1 ton CO2/yr)
    const treesRequired = Math.round(currentFootprint * 50);
    kpiTreesEl.innerText = treesRequired.toLocaleString();

    // National Average comparison (US average: 16 tons/capita/yr)
    const usAvg = 16.0;
    const differencePercent = ((currentFootprint - usAvg) / usAvg) * 100;
    if (differencePercent >= 0) {
      kpiComparisonEl.innerText = `+${Math.round(differencePercent)}%`;
      kpiComparisonEl.style.color = 'var(--color-rose)';
    } else {
      kpiComparisonEl.innerText = `${Math.round(differencePercent)}%`;
      kpiComparisonEl.style.color = 'var(--color-emerald)';
    }

    // 3. Render Chart
    renderChart();

    // 4. Render logs table
    renderLogsTable();

    // 5. Generate Personalized Insights
    renderInsights(currentFootprint);
  }

  function renderChart() {
    const ctx = document.getElementById('emissionsChart');
    if (!ctx) return;

    const data = {
      labels: ['Energy', 'Transportation', 'Food', 'Waste'],
      datasets: [{
        data: [
          state.footprintData.energy,
          state.footprintData.transportation,
          state.footprintData.food,
          state.footprintData.waste
        ],
        backgroundColor: [
          '#6366f1', // Indigo
          '#06b6d4', // Cyan
          '#10b981', // Emerald
          '#f43f5e'  // Rose
        ],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        hoverOffset: 10
      }]
    };

    if (emissionsChart) {
      emissionsChart.data = data;
      emissionsChart.update();
    } else {
      emissionsChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94a3b8',
                font: {
                  family: 'Plus Jakarta Sans',
                  size: 11,
                  weight: '600'
                },
                padding: 15
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  }

  function renderLogsTable() {
    if (state.historyLogs.length === 0) {
      logsTbodyEl.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No logs recorded yet. Use the "Calculate Footprint" tab above to start.
          </td>
        </tr>
      `;
      return;
    }

    logsTbodyEl.innerHTML = state.historyLogs.map(log => {
      const date = new Date(log.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `
        <tr>
          <td>${date}</td>
          <td>${log.energy.toFixed(1)} t</td>
          <td>${log.transportation.toFixed(1)} t</td>
          <td>${log.food.toFixed(1)} t</td>
          <td>${log.waste.toFixed(1)} t</td>
          <td style="font-weight: 700; color: var(--color-cyan);">${log.totalCO2.toFixed(1)} t</td>
        </tr>
      `;
    }).join('');
  }

  function renderInsights(currentFootprint) {
    const fd = state.footprintData;
    const insights = [];

    // Find the category with maximum emissions
    const categories = [
      { name: 'Energy', value: fd.energy, icon: 'zap', colorClass: 'warning', tip: 'Your energy footprint is high. Swapping to LED bulbs, washing laundry in cold water, and setting up a smart thermostat can trim up to 1 ton of CO2 annually.' },
      { name: 'Transportation', value: fd.transportation, icon: 'car', colorClass: 'warning', tip: 'Travel represents your largest emissions sector. Reduce driving by bike commuting, bundle trips together, or substitute flight hours with train routes.' },
      { name: 'Food', value: fd.food, icon: 'utensils', colorClass: 'warning', tip: 'Diet accounts for substantial agricultural greenhouse gases. Adopting Meatless Mondays or shifting to plant-based diets yields immediate drops.' },
      { name: 'Waste', value: fd.waste, icon: 'recycle', colorClass: 'warning', tip: 'Waste impacts remain high. Maximize paper/metal recycling, limit purchasing single-use packaging, and start home composting.' }
    ];

    // Sort categories from highest to lowest emissions
    categories.sort((a, b) => b.value - a.value);

    // 1. Add primary threat insight
    if (categories[0].value > 0.5) {
      insights.push({
        title: `Primary Source: ${categories[0].name}`,
        desc: categories[0].tip,
        icon: categories[0].icon,
        colorClass: 'warning'
      });
    }

    // 2. Add performance summary insight
    if (currentFootprint > 15) {
      insights.push({
        title: 'High Carbon Footprint',
        desc: 'Your emissions are above the national average of 16.0 tons. Focus on major shifts like insulating your residence or transitioning away from traditional fossil vehicles.',
        icon: 'alert-triangle',
        colorClass: 'warning'
      });
    } else if (currentFootprint <= 6.0) {
      insights.push({
        title: 'Eco-Champion Level',
        desc: 'Awesome job! Your annual footprint is well below national averages and aligns closely with the United Nations stabilization goals.',
        icon: 'award',
        colorClass: 'success'
      });
    } else {
      insights.push({
        title: 'Moderate Footprint',
        desc: 'You are performing better than average, but opportunities exist. Explore the "Take Action" tab to activate additional habits.',
        icon: 'trending-down',
        colorClass: 'info'
      });
    }

    // 3. Add Habit tips
    if (state.activeHabits.size === 0) {
      insights.push({
        title: 'Adopt Your First Habit',
        desc: 'Go to the "Take Action" tab to select simple daily changes like washing laundry in cold water or meatless meals to start lowering your score.',
        icon: 'check-square',
        colorClass: 'info'
      });
    } else {
      insights.push({
        title: `${state.activeHabits.size} Active Habit(s)`,
        desc: `Your active habits are preventing emissions from escaping. Maintain these habits to ensure long-term carbon reduction.`,
        icon: 'shield',
        colorClass: 'success'
      });
    }

    // Render insights list HTML
    insightsContainerEl.innerHTML = insights.map(ins => {
      return `
        <div class="insight-item">
          <div class="insight-icon-container ${ins.colorClass}">
            <i data-lucide="${ins.icon}"></i>
          </div>
          <div>
            <div class="insight-title">${ins.title}</div>
            <div class="insight-desc">${ins.desc}</div>
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();
  }

  function renderHabitsGrid() {
    if (state.habitsData.length === 0) return;

    habitsContainerEl.innerHTML = state.habitsData.map(habit => {
      const isActive = state.activeHabits.has(habit.id);
      const activeClass = isActive ? 'active' : '';
      return `
        <div class="habit-card ${activeClass}" data-habit-id="${habit.id}">
          <div>
            <div class="habit-header">
              <div class="habit-icon">
                <i data-lucide="${habit.icon || 'leaf'}"></i>
              </div>
              <div class="habit-name">${habit.name}</div>
            </div>
            <div class="habit-desc">${habit.description}</div>
          </div>
          <div class="habit-impact">
            <i data-lucide="arrow-down"></i> -${habit.co2Savings} kg CO₂e / yr
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();

    // Bind click events to cards
    document.querySelectorAll('.habit-card').forEach(card => {
      card.addEventListener('click', () => {
        const habitId = card.getAttribute('data-habit-id');
        toggleHabit(habitId);
      });
    });
  }

  function toggleHabit(habitId) {
    if (state.activeHabits.has(habitId)) {
      state.activeHabits.delete(habitId);
    } else {
      state.activeHabits.add(habitId);
    }

    // Persist to local storage
    localStorage.setItem('ecotrace_habits', JSON.stringify(Array.from(state.activeHabits)));

    // Sync with backend API
    syncActiveHabits();

    // Re-render
    renderHabitsGrid();
    renderDashboard();
  }

  async function syncActiveHabits() {
    try {
      // API sync for logged-in status or persistent sessions (mock endpoints here)
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeHabits: Array.from(state.activeHabits) })
      });
    } catch (e) {
      // Silent catch (we rely primarily on local state and standard storage)
    }
  }
});
