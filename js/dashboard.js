// Store chart instances to update them later
let certificatesChart;
let exportersChart;
let overviewChart;

// Format date for display
function formatDashboardDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts * 1000);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Render contract address link
function renderContractLink(elId, address) {
  const el = document.getElementById(elId);
  if (!el || !address) return;
  el.innerHTML = `<span class="account-address-text" title="${address}">${truncateAddress(address)}</span>
    <a href="${window.CONTRACT.explore}/address/${address}" target="_blank" rel="noopener noreferrer" title="View on explorer" aria-label="View on block explorer">
      <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
    </a>`;
}

// Truncate address helper
function truncateAddress(address) {
  if (!address) return '';
  return `${address.substr(0, 7)}...${address.substr(address.length - 8)}`;
}

// Fetch events from chain
async function fetchUploadEvents() {
  try {
    console.log('🔍 Fetching upload events...');
    const latestBlock = await window.web3RPC.eth.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 99999);
    
    let events = [];
    try {
      events = await window.contractRPC.getPastEvents('addHash', {
        fromBlock,
        toBlock: 'latest'
      });
    } catch (err1) {
      try {
        events = await window.contractRPC.events.addHash.getPastEvents({
          fromBlock,
          toBlock: 'latest'
        });
      } catch (err2) {
        console.warn('Both event fetch methods failed');
      }
    }
    return events;
  } catch (error) {
    console.error('❌ Error fetching upload events:', error);
    return [];
  }
}

// Process events into useful data OR use dummy data
function processEventData(events) {
  // Certificates over time (last 14 days)
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dateLabels = [];
  let dateCounts = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dateLabels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    dateCounts.push(0);
  }

  // Exporter counts
  const exporterCounts = {};
  events.forEach(event => {
    // Count per date
    if (event.blockNumber) {
      window.web3RPC.eth.getBlock(event.blockNumber).then(block => {
        const eventDate = new Date(block.timestamp * 1000);
        eventDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 14) {
          dateCounts[13 - daysDiff]++;
        }
      }).catch(() => {});
    }

    // Count per exporter
    const exporter = event.returnValues._exporter || 'Unknown';
    exporterCounts[exporter] = (exporterCounts[exporter] || 0) + 1;
  });

  // If no real data, use dummy data
  if (Object.keys(exporterCounts).length === 0) {
    console.log('No real events, using dummy data!');
    // Dummy date counts
    dateCounts = [3, 5, 2, 8, 4, 6, 10, 7, 3, 9, 5, 12, 8, 4];
    
    // Dummy exporters
    const dummyExporters = [
      '0x742d35Cc6634C0532925a3b886D81c97b95620F7',
      '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      '0xFFcf8FDEE72ac11b5c542428B35EEF5769C40f45',
      '0x22d491Bde232f474a2f1e5525781e4bA52496630',
      '0x1aE0EA34a72D944a8C7603FfBd399aD31e514f95',
      '0x2a65Aca4D5fC5B5C859090a6c34d164135398226'
    ];
    
    dummyExporters.forEach((addr, idx) => {
      exporterCounts[addr] = [15, 12, 9, 7, 5, 3][idx];
    });
  }

  return { dateLabels, dateCounts, exporterCounts };
}

// Create Certificates Over Time Chart (Line Chart)
function createCertificatesChart(dateLabels, dateCounts) {
  const ctx = document.getElementById('certificatesChart');
  if (!ctx) return;

  if (certificatesChart) {
    certificatesChart.destroy();
  }

  certificatesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dateLabels,
      datasets: [{
        label: 'Certificates',
        data: dateCounts,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Create Exporter Activity Chart (Bar Chart)
function createExportersChart(exporterCounts) {
  const ctx = document.getElementById('exportersChart');
  if (!ctx) return;

  if (exportersChart) {
    exportersChart.destroy();
  }

  const sortedExporters = Object.entries(exporterCounts).sort((a, b) => b[1] - a[1]);
  const labels = sortedExporters.slice(0, 8).map(([addr]) => truncateAddress(addr));
  const data = sortedExporters.slice(0, 8).map(([, count]) => count);
  const colors = [
    'rgba(102, 126, 234, 0.8)',
    'rgba(118, 75, 162, 0.8)',
    'rgba(240, 147, 43, 0.8)',
    'rgba(25, 135, 84, 0.8)',
    'rgba(220, 53, 69, 0.8)',
    'rgba(13, 202, 240, 0.8)',
    'rgba(108, 117, 125, 0.8)',
    'rgba(255, 193, 7, 0.8)'
  ];

  exportersChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Certificates',
        data,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Create Overview Donut Chart
function createOverviewChart(totalDocs, totalExporters, recentUploads) {
  const ctx = document.getElementById('overviewChart');
  if (!ctx) return;

  if (overviewChart) {
    overviewChart.destroy();
  }

  // Use dummy data if no real data
  const docs = totalDocs || 47;
  const exporters = totalExporters || 6;
  const uploads = recentUploads || 86;

  overviewChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Certificates', 'Exporters', 'Recent Uploads'],
      datasets: [{
        data: [docs, exporters, uploads],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(240, 147, 43, 0.8)'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Main dashboard load function
async function loadDashboardAnalytics() {
  console.log('📊 Loading dashboard analytics...');
  try {
    // Try to get real contract data, if fails use dummy
    let exporterCount = 0, hashCount = 0, owner = '';
    try {
      [exporterCount, hashCount, owner] = await Promise.all([
        window.contractRPC.methods.count_Exporters().call(),
        window.contractRPC.methods.count_hashes().call(),
        window.contractRPC.methods.owner().call()
      ]);
    } catch (err) {
      console.warn('Using dummy contract data');
      exporterCount = 6;
      hashCount = 47;
      owner = '0x742d35Cc6634C0532925a3b886D81c97b95620F7';
    }

    // Update KPIs
    document.getElementById('dash-total-docs').textContent = hashCount;
    document.getElementById('dash-total-exporters').textContent = exporterCount;
    renderContractLink('dash-contract', window.CONTRACT.address);
    renderContractLink('dash-owner', owner);

    // Fetch and process events
    let events = [];
    try {
      events = await fetchUploadEvents();
    } catch (err) {
      console.warn('Using dummy events');
    }
    
    document.getElementById('dash-recent-uploads').textContent = events.length || 86;

    const { dateLabels, dateCounts, exporterCounts } = processEventData(events);

    // Wait a moment for block data to load, then update charts
    setTimeout(() => {
      createCertificatesChart(dateLabels, dateCounts);
      createExportersChart(exporterCounts);
      createOverviewChart(parseInt(hashCount), parseInt(exporterCount), events.length);
    }, 500);

    console.log('✅ Dashboard analytics loaded successfully!');
  } catch (error) {
    console.error('❌ Dashboard load error:', error);
  }
}

// Initialize dashboard
async function initDashboardPage() {
  console.log('🚀 Initializing dashboard page...');
  if (!window.location.pathname.includes('dashboard.html')) return;

  // Always initialize (even without wallet connected for demo)
  // Show wallet info if available
  if (window.userAddress) {
    document.querySelector('.wallet-status')?.classList.remove('d-none');

    const balanceEl = document.getElementById('dash-balance');
    const networkHint = document.getElementById('dash-network');
    const balanceMain = document.getElementById('userBalance');

    if (balanceEl && balanceMain) {
      balanceEl.textContent = balanceMain.textContent || '1.5 ETH';
    }
    if (networkHint) {
      networkHint.textContent = window.chainID || 'Sepolia';
    }
  }

  // Wait for web3 to be ready OR just load dummy data
  let hasWeb3 = window.web3RPC && window.contractRPC;
  if (!hasWeb3) {
    console.warn('No web3 found, loading dummy data immediately!');
    // Set dummy KPI data
    document.getElementById('dash-total-docs').textContent = 47;
    document.getElementById('dash-total-exporters').textContent = 6;
    document.getElementById('dash-recent-uploads').textContent = 86;
    document.getElementById('dash-balance').textContent = '1.5 ETH';
    document.getElementById('dash-network').textContent = 'Sepolia';
    renderContractLink('dash-contract', '0xB01753970CB6A7C7c5b4A5ECFF875DC17568aa7B');
    renderContractLink('dash-owner', '0x742d35Cc6634C0532925a3b886D81c97b95620F7');

    // Load dummy charts immediately
    const now = new Date();
    now.setHours(0,0,0,0);
    const dateLabels = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dateLabels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    }
    
    const dummyExporterCounts = {
      '0x742d35Cc6634C0532925a3b886D81c97b95620F7':15,
      '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1':12,
      '0xFFcf8FDEE72ac11b5c542428B35EEF5769C40f45':9,
      '0x22d491Bde232f474a2f1e5525781e4bA52496630':7,
      '0x1aE0EA34a72D944a8C7603FfBd399aD31e514f95':5,
      '0x2a65Aca4D5fC5B5C859090a6c34d164135398226':3
    };

    createCertificatesChart(dateLabels, [3,5,2,8,4,6,10,7,3,9,5,12,8,4]);
    createExportersChart(dummyExporterCounts);
    createOverviewChart(47,6,86);
    return;
  }

  // Check if user is owner (if wallet connected)
  let isOwner = window.isContractOwner;
  if (isOwner === undefined || isOwner === false) {
    if (typeof checkIsContractOwner === 'function') {
      isOwner = await checkIsContractOwner();
      window.isContractOwner = isOwner;
    }
  }

  await loadDashboardAnalytics();
}

// Start initialization when page loads
window.addEventListener('load', () => {
  setTimeout(initDashboardPage, 400);
});