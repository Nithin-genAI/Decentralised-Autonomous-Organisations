// ===== UI.JS — All Rendering & DOM Functions =====

// ============== WALLET CONNECT ==============

function connectWallet(role) {
  AppState.currentRole = role;

  if (role === 'admin') {
    AppState.currentWallet = '0xAd...3f1';
    AppState.currentUser = { id: 'admin', name: 'State Finance Ministry', role: 'admin' };
  } else if (role === 'official') {
    AppState.currentWallet = '0xOf...7a2';
    AppState.currentUser = { id: 'v1', name: 'Dr. Rajan Mehta', role: 'official', district: 'Central' };
  } else if (role === 'hospital') {
    AppState.currentWallet = '0xHs...9b4';
    AppState.currentUser = { id: 'h1', name: 'District General Hospital', role: 'hospital' };
  }

  showTxOverlay('Connecting Wallet...', 'Authenticating with blockchain network');
  setTimeout(() => {
    hideTxOverlay();
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('app-page').classList.add('active');
    setupRoleUI();
    initDashboard();
    showToast(`✅ Connected as ${AppState.currentUser.name}`, 'success');
  }, 1800);
}

function disconnectWallet() {
  AppState.currentRole = null;
  AppState.currentWallet = null;
  AppState.currentUser = null;
  document.getElementById('app-page').classList.remove('active');
  document.getElementById('landing-page').classList.add('active');
  switchView('dashboard');
  updateLandingStats();
  showToast('Wallet disconnected', 'info');
}

function setupRoleUI() {
  const role = AppState.currentRole;
  const avatars = { admin: '🏛️', official: '🗳️', hospital: '🏥' };
  const roleLabels = { admin: 'State Admin', official: 'District Official', hospital: 'Hospital' };
  const badges = { admin: 'STATE ADMIN', official: 'DISTRICT OFFICIAL', hospital: 'HOSPITAL' };

  document.getElementById('sidebar-avatar').textContent = avatars[role];
  document.getElementById('sidebar-role').textContent = AppState.currentUser.name;
  document.getElementById('sidebar-addr').textContent = AppState.currentWallet;
  document.getElementById('role-badge-top').textContent = badges[role];

  // Role-based nav visibility
  const navCreate = document.getElementById('nav-create');
  const navVote = document.getElementById('nav-vote');
  const navTreasury = document.getElementById('nav-treasury');

  if (role === 'admin') {
    navCreate.style.display = 'none';
    navVote.style.display = 'none';
  } else if (role === 'official') {
    navCreate.style.display = 'none';
  } else if (role === 'hospital') {
    navVote.style.display = 'none';
  }

  // Treasury access — always show for admin
  if (role !== 'admin') {
    // Still show treasury in read-only for others
  }

  // Update treasury view based on role
  renderTreasuryView();
}

// ============== VIEW SWITCHING ==============

function switchView(viewName) {
  const views = ['dashboard', 'proposals', 'create', 'vote', 'treasury', 'audit'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.toggle('hidden', v !== viewName);
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  const titles = {
    dashboard: 'Dashboard',
    proposals: 'All Proposals',
    create: 'Create Proposal',
    vote: 'Vote on Proposals',
    treasury: 'Treasury Management',
    audit: 'Audit Log',
  };

  document.getElementById('topbar-title').textContent = titles[viewName] || viewName;
  document.getElementById('breadcrumb').textContent = `HealthDAO / ${titles[viewName] || viewName}`;

  if (viewName === 'proposals') renderProposalsGrid(AppState.proposals);
  if (viewName === 'vote') renderVoteView();
  if (viewName === 'treasury') renderTreasuryView();
  if (viewName === 'audit') renderAuditLog();
  if (viewName === 'create') initCreateForm();
}

// ============== DASHBOARD ==============

function initDashboard() {
  updateDashboardStats();
  renderProposalsMiniList();
  renderCategoryLimits();
  renderActivityFeed();
  // Block counter animation
  setInterval(() => {
    AppState.blockNumber += Math.floor(Math.random() * 3) + 1;
    document.getElementById('block-number').textContent = AppState.blockNumber.toLocaleString('en-IN');
  }, 8000);
}

function updateDashboardStats() {
  const executed = AppState.proposals.filter(p => p.status === PROPOSAL_STATUS.EXECUTED || p.status === PROPOSAL_STATUS.PROOF);
  const disbursed = executed.reduce((s, p) => s + p.amount, 0);
  const active = AppState.proposals.filter(p => p.status === PROPOSAL_STATUS.VOTING || p.status === PROPOSAL_STATUS.REVIEW || p.status === PROPOSAL_STATUS.SUBMITTED).length;

  document.getElementById('kpi-treasury').textContent = formatAmount(AppState.treasury);
  document.getElementById('kpi-proposals').textContent = AppState.proposals.length;
  document.getElementById('kpi-proposals-change').textContent = `${active} Active`;
  document.getElementById('kpi-approved').textContent = executed.length;
  document.getElementById('kpi-disbursed').textContent = `₹${disbursed.toLocaleString('en-IN')}L Disbursed`;

  // Landing page stats
  updateLandingStats();
}

function updateLandingStats() {
  const executed = AppState.proposals.filter(p => p.status === PROPOSAL_STATUS.EXECUTED || p.status === PROPOSAL_STATUS.PROOF);
  document.getElementById('stat-treasury').textContent = formatAmount(AppState.treasury);
  document.getElementById('stat-proposals').textContent = AppState.proposals.length;
  document.getElementById('stat-approved').textContent = executed.length;
}

function formatAmount(lakhs) {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Cr`;
  return `₹${lakhs}L`;
}

function renderProposalsMiniList() {
  const container = document.getElementById('proposals-mini-list');
  if (!container) return;
  const recent = AppState.proposals.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-state-sm">No proposals yet.</div>';
    return;
  }
  container.innerHTML = recent.map(p => `
    <div class="proposal-mini" onclick="openProposalDetail('${p.id}')">
      <div class="prop-mini-info">
        <div class="prop-mini-title">${escapeHTML(p.title)}</div>
        <div class="prop-mini-meta">${p.hospital} · ${p.category} · <span class="status-badge status-${p.status}">${p.status.toUpperCase()}</span></div>
      </div>
      <div class="prop-mini-amount">₹${p.amount}L</div>
    </div>
  `).join('');
}

function renderCategoryLimits() {
  const container = document.getElementById('cat-limit-list');
  if (!container) return;
  container.innerHTML = Object.entries(CATEGORY_LIMITS).map(([name, info]) => {
    const used = AppState.proposals
      .filter(p => p.category === name && (p.status === PROPOSAL_STATUS.EXECUTED || p.status === PROPOSAL_STATUS.PROOF))
      .reduce((s, p) => s + p.amount, 0);
    const pct = Math.min(100, (used / info.limit) * 100).toFixed(0);
    return `
      <div class="cat-item" style="flex-direction: column; gap: 6px; align-items: stretch;">
        <div style="display:flex; justify-content:space-between;">
          <span class="cat-name">${name}</span>
          <span class="cat-limit" style="color: ${info.color}">₹${info.limit}L limit</span>
        </div>
        <div class="alloc-bar">
          <div class="alloc-fill" style="width:${pct}%; background: ${info.color}"></div>
        </div>
        <span style="font-size:11px; color: var(--text-muted)">₹${used}L used (${pct}%)</span>
      </div>
    `;
  }).join('');
}

function renderActivityFeed() {
  const container = document.getElementById('activity-list');
  if (!container) return;
  // Keep existing + new items
}

function addActivity(icon, title, subtitle) {
  const container = document.getElementById('activity-list');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'activity-item';
  div.innerHTML = `
    <span class="act-icon">${icon}</span>
    <div class="act-text">
      <strong>${escapeHTML(title)}</strong>
      <small>${escapeHTML(subtitle)}</small>
    </div>
    <span class="act-time">Just now</span>
  `;
  container.insertBefore(div, container.firstChild);
  if (container.children.length > 20) container.removeChild(container.lastChild);
}

// ============== PROPOSALS GRID ==============

function renderProposalsGrid(proposals) {
  const container = document.getElementById('proposals-grid');
  if (!proposals || proposals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No Proposals Found</h3>
        <p>No proposals match your current filter.</p>
      </div>`;
    return;
  }
  container.innerHTML = proposals.map(p => renderProposalCard(p)).join('');
}

function renderProposalCard(p) {
  const vs = Blockchain.getProposalVoteSummary(p);
  const yesPct = vs.total > 0 ? (vs.yes / vs.total * 100).toFixed(0) : 0;
  const deadline = new Date(p.deadline);
  const daysLeft = Math.ceil((deadline - Date.now()) / 86400000);
  const deadlineText = daysLeft > 0 ? `${daysLeft}d left` : 'Voting closed';

  return `
    <div class="proposal-card" data-status="${p.status}" data-id="${p.id}" onclick="openProposalDetail('${p.id}')">
      <div class="prop-card-header">
        <div class="prop-card-title">${escapeHTML(p.title)}</div>
        <span class="status-badge status-${p.status}">${p.status.toUpperCase()}</span>
      </div>
      <div class="prop-card-meta">
        <span class="meta-tag">${p.category}</span>
        <span class="meta-tag ${p.priority.toLowerCase()}">${priorityEmoji(p.priority)} ${p.priority}</span>
      </div>
      <div class="prop-card-amount">₹${p.amount.toLocaleString('en-IN')} Lakhs</div>
      ${p.status === PROPOSAL_STATUS.VOTING || p.status === PROPOSAL_STATUS.APPROVED || p.status === PROPOSAL_STATUS.REJECTED ? `
        <div class="vote-bar-wrapper">
          <div class="vote-bar-labels">
            <span class="vote-yes-label">✅ ${vs.yes} YES (${yesPct}%)</span>
            <span class="vote-no-label">❌ ${vs.no} NO</span>
          </div>
          <div class="vote-bar">
            <div class="vote-bar-fill" style="width: ${yesPct}%"></div>
          </div>
        </div>
      ` : ''}
      <div class="prop-card-footer">
        <span class="prop-deadline">⏱ ${deadlineText}</span>
        <span class="prop-hospital">🏥 ${escapeHTML(p.hospital)}</span>
      </div>
    </div>
  `;
}

function priorityEmoji(p) {
  return { Emergency: '🔴', Routine: '🟡', Planned: '🟢' }[p] || '⚪';
}

function filterProposals(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = filter === 'all'
    ? AppState.proposals
    : AppState.proposals.filter(p => p.status === filter);
  renderProposalsGrid(filtered);
}

function searchProposals(query) {
  const q = query.toLowerCase();
  const filtered = AppState.proposals.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.hospital.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  renderProposalsGrid(filtered);
}

// ============== PROPOSAL DETAIL MODAL ==============

function openProposalDetail(id) {
  const p = AppState.proposals.find(x => x.id === id);
  if (!p) return;
  const vs = Blockchain.getProposalVoteSummary(p);
  const yesPct = vs.total > 0 ? (vs.yes / vs.total * 100).toFixed(0) : 0;
  const deadline = new Date(p.deadline);
  const isExpired = Date.now() > deadline.getTime();
  const userVote = AppState.currentRole === 'official'
    ? Blockchain.getVoterChoice(p, AppState.currentUser.id) : null;
  const hasVoted = userVote !== null;

  let actionsHTML = '';
  
  // Vote buttons for officials if voting is open
  if (AppState.currentRole === 'official' && p.status === PROPOSAL_STATUS.VOTING && !isExpired) {
    if (!hasVoted) {
      actionsHTML = `
        <div style="display:flex; gap:10px;">
          <button class="btn-success" onclick="voteOnProposal('${p.id}', 'yes')">✅ Vote YES</button>
          <button class="btn-danger" onclick="voteOnProposal('${p.id}', 'no')">❌ Vote NO</button>
        </div>`;
    } else {
      actionsHTML = `<div class="voted-message">✓ You voted ${userVote.toUpperCase()} on this proposal</div>`;
    }
  }

  // Execute button for admin
  if (AppState.currentRole === 'admin' && p.status === PROPOSAL_STATUS.APPROVED) {
    actionsHTML += `
      <div class="execute-panel">
        <h4>💸 Execute Fund Transfer</h4>
        <p>This proposal has been approved. Transfer ₹${p.amount}L to ${escapeHTML(p.hospital)}.</p>
        <button class="btn-primary" onclick="executeProposal('${p.id}')">⚡ Execute Smart Contract</button>
      </div>`;
  }

  // Advance status for admin
  if (AppState.currentRole === 'admin' && (p.status === PROPOSAL_STATUS.SUBMITTED || p.status === PROPOSAL_STATUS.REVIEW)) {
    actionsHTML += `
      <div style="margin-top:12px;">
        <button class="btn-purple" onclick="advanceProposal('${p.id}')">▶ Advance to ${p.status === PROPOSAL_STATUS.SUBMITTED ? 'Under Review' : 'Voting'}</button>
      </div>`;
  }

  // Proof upload for hospital
  if (AppState.currentRole === 'hospital' && p.status === PROPOSAL_STATUS.EXECUTED && p.hospitalId === AppState.currentUser.id) {
    actionsHTML += `
      <div class="proof-upload">
        <p>Upload your fund utilization proof to the blockchain</p>
        <button class="btn-success" onclick="uploadProof('${p.id}')">📎 Upload Utilization Proof (IPFS)</button>
      </div>`;
  }

  const proofSection = p.proofHash ? `
    <div class="modal-prop-section">
      <h4>✅ Utilization Proof</h4>
      <div class="ipfs-display">${p.proofHash}</div>
    </div>` : '';

  const modalBody = `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
        <div style="flex:1;">
          <h2 style="font-size:18px; color:#fff; line-height:1.4;">${escapeHTML(p.title)}</h2>
          <div class="modal-prop-amount">₹${p.amount.toLocaleString('en-IN')} Lakhs</div>
        </div>
        <span class="status-badge status-${p.status}" style="font-size:12px;">${p.status.toUpperCase()}</span>
      </div>

      <div class="modal-prop-pills" style="margin-bottom:16px;">
        <span class="meta-tag">${p.category}</span>
        <span class="meta-tag ${p.priority.toLowerCase()}">${priorityEmoji(p.priority)} ${p.priority}</span>
        <span class="meta-tag">🏥 ${escapeHTML(p.hospital)}</span>
        ${p.ipfsHash ? `<span class="meta-tag">📎 IPFS: ${p.ipfsHash.substring(0,12)}...</span>` : ''}
      </div>

      <div class="modal-prop-section">
        <h4>Description</h4>
        <div class="modal-prop-desc">${escapeHTML(p.description)}</div>
      </div>

      <div class="modal-prop-section">
        <h4>Voting Progress</h4>
        <div class="vote-stats" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:12px;">
          <div class="vstat vstat-yes"><div class="vstat-num">${vs.yes}</div><div class="vstat-label">YES Votes</div></div>
          <div class="vstat vstat-no"><div class="vstat-num">${vs.no}</div><div class="vstat-label">NO Votes</div></div>
          <div class="vstat" style="background:rgba(99,122,255,0.1); border:1px solid rgba(99,122,255,0.3);">
            <div class="vstat-num" style="color:#818cf8;">${vs.quorum}</div>
            <div class="vstat-label">Quorum Req.</div>
          </div>
        </div>
        <div class="vote-bar" style="height:10px; margin-bottom:8px;">
          <div class="vote-bar-fill" style="width:${yesPct}%"></div>
        </div>
        <div style="font-size:12px; color:var(--text-muted);">${yesPct}% YES · Threshold: ${Math.round(GOVERNANCE.approvalThreshold*100)}% · ${vs.meetsQuorum ? '✅ Quorum met' : '⏳ Quorum not yet met'}</div>
      </div>

      <div class="modal-prop-section">
        <h4>Proposal Details</h4>
        <div class="proposal-preview">
          <div class="preview-row"><span class="preview-key">Proposal ID</span><span class="preview-val" style="font-family:monospace;">${p.id}</span></div>
          <div class="preview-row"><span class="preview-key">Block Created</span><span class="preview-val" style="font-family:monospace;">#${p.blockCreated}</span></div>
          <div class="preview-row"><span class="preview-key">Submitted</span><span class="preview-val">${new Date(p.submittedAt).toLocaleDateString('en-IN')}</span></div>
          <div class="preview-row"><span class="preview-key">Voting Deadline</span><span class="preview-val">${new Date(p.deadline).toLocaleDateString('en-IN')} ${isExpired ? '(Expired)' : ''}</span></div>
          ${p.approvedAt ? `<div class="preview-row"><span class="preview-key">Approved</span><span class="preview-val">${new Date(p.approvedAt).toLocaleDateString('en-IN')}</span></div>` : ''}
          ${p.executedAt ? `<div class="preview-row"><span class="preview-key">Executed</span><span class="preview-val">${new Date(p.executedAt).toLocaleDateString('en-IN')}</span></div>` : ''}
          <div class="preview-row"><span class="preview-key">Wallet</span><span class="preview-val" style="font-family:monospace;">${p.walletAddr}</span></div>
        </div>
      </div>

      ${proofSection}
      ${actionsHTML}
    </div>
  `;

  showModal(`Proposal — ${p.id}`, modalBody, []);
}

// ============== VOTE VIEW ==============

function renderVoteView() {
  const container = document.getElementById('vote-container');
  if (!container) return;

  const votingProposals = AppState.proposals.filter(p => p.status === PROPOSAL_STATUS.VOTING);

  if (votingProposals.length === 0) {
    container.className = '';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🗳️</div>
        <h3>No Active Proposals for Voting</h3>
        <p>Proposals in "Voting" stage will appear here for district officials to vote on.</p>
      </div>`;
    return;
  }

  container.className = 'vote-container';
  container.innerHTML = votingProposals.map(p => renderVoteCard(p)).join('');
}

function renderVoteCard(p) {
  const vs = Blockchain.getProposalVoteSummary(p);
  const yesPct = vs.total > 0 ? (vs.yes / vs.total * 100).toFixed(0) : 0;
  const quorumPct = Math.min(100, (vs.total / vs.quorum) * 100).toFixed(0);
  const deadline = new Date(p.deadline);
  const isExpired = Date.now() > deadline.getTime();
  const daysLeft = Math.ceil((deadline - Date.now()) / 86400000);

  const voterId = AppState.currentUser?.id;
  const hasVoted = voterId ? Blockchain.hasVoted(p, voterId) : false;
  const userChoice = voterId ? Blockchain.getVoterChoice(p, voterId) : null;

  let voteSection = '';
  if (AppState.currentRole !== 'official') {
    voteSection = `<div style="font-size:13px; color:var(--text-muted); text-align:center; padding:10px;">Public view — voting requires District Official role</div>`;
  } else if (isExpired) {
    voteSection = `<div class="deadline-warning">⏰ Voting period has ended</div>`;
  } else if (hasVoted) {
    voteSection = `<div class="voted-message">✓ You voted <strong>${userChoice?.toUpperCase()}</strong> · Thank you for participating</div>`;
  } else {
    voteSection = `
      <div class="vote-btn-group">
        <button class="btn-success" onclick="voteOnProposal('${p.id}', 'yes')">✅ Vote YES</button>
        <button class="btn-danger" onclick="voteOnProposal('${p.id}', 'no')">❌ Vote NO</button>
      </div>`;
  }

  return `
    <div class="vote-card" id="vote-card-${p.id}">
      <div class="vote-card-title">${escapeHTML(p.title)}</div>
      <div class="vote-card-hospital">🏥 ${escapeHTML(p.hospital)} · ${p.category} · <span class="meta-tag ${p.priority.toLowerCase()}">${priorityEmoji(p.priority)} ${p.priority}</span></div>

      ${isExpired ? '' : `<div class="deadline-warning" style="background:rgba(245,158,11,0.1); border-color:rgba(245,158,11,0.3); color:var(--amber);">⏱ ${daysLeft > 0 ? `${daysLeft} day(s) remaining` : 'Closing today'}</div>`}

      <div class="vote-detail-row"><span class="vdr-key">Amount Requested</span><span class="vdr-val">₹${p.amount.toLocaleString('en-IN')} Lakhs</span></div>
      <div class="vote-detail-row"><span class="vdr-key">Proposal ID</span><span class="vdr-val" style="font-family:monospace;">${p.id}</span></div>

      <div class="vote-stats">
        <div class="vstat vstat-yes"><div class="vstat-num">${vs.yes}</div><div class="vstat-label">YES Votes</div></div>
        <div class="vstat vstat-no"><div class="vstat-num">${vs.no}</div><div class="vstat-label">NO Votes</div></div>
      </div>

      <div class="vote-quorum-bar">
        <div class="vote-quorum-label">
          <span>Quorum Progress</span>
          <span>${vs.total} / ${vs.quorum} required</span>
        </div>
        <div class="quorum-bar">
          <div class="quorum-fill" style="width:${quorumPct}%"></div>
        </div>
      </div>

      <div style="text-align:center; font-size:12px; color:var(--text-muted); margin-bottom:8px;">
        Approval threshold: ${Math.round(GOVERNANCE.approvalThreshold*100)}% YES · Current: ${yesPct}%
      </div>

      ${voteSection}

      <div style="margin-top:12px; text-align:center;">
        <button class="btn-secondary" style="font-size:12px; padding:6px 14px;" onclick="openProposalDetail('${p.id}')">View Full Details</button>
      </div>
    </div>
  `;
}

// ============== TREASURY VIEW ==============

function renderTreasuryView() {
  const balDisplay = document.getElementById('treasury-balance-display');
  if (balDisplay) balDisplay.textContent = `₹${AppState.treasury.toLocaleString('en-IN')} Lakhs`;

  // Admin actions
  const actionsDiv = document.getElementById('treasury-actions');
  if (actionsDiv) {
    if (AppState.currentRole === 'admin') {
      actionsDiv.innerHTML = `
        <div class="admin-action-card">
          <h4>💰 Deposit Funds</h4>
          <div class="deposit-input">
            <input type="number" id="deposit-amount" placeholder="Amount in Lakhs" min="1" />
            <button class="btn-primary" onclick="depositFunds()">Deposit →</button>
          </div>
        </div>
        <div class="admin-action-card">
          <h4>📋 Approved Proposals (Pending Execution)</h4>
          <div id="pending-exec-list">${renderPendingExecList()}</div>
        </div>
      `;
    } else {
      actionsDiv.innerHTML = `
        <div style="text-align:center; padding:32px; color:var(--text-muted);">
          <div style="font-size:40px; margin-bottom:12px;">🔒</div>
          <p>Treasury management is restricted to State Admin</p>
        </div>
      `;
    }
  }

  // Allocation bars
  renderAllocationBars();

  // Transaction list
  renderTxList();
}

function renderPendingExecList() {
  const pending = AppState.proposals.filter(p => p.status === PROPOSAL_STATUS.APPROVED);
  if (pending.length === 0) return '<div class="empty-state-sm">No approved proposals pending execution.</div>';
  return pending.map(p => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
      <div>
        <div style="font-size:13px; color:#fff;">${escapeHTML(p.title.substring(0,35))}...</div>
        <div style="font-size:12px; color:var(--text-muted);">₹${p.amount}L · ${escapeHTML(p.hospital)}</div>
      </div>
      <button class="btn-success" style="font-size:12px; padding:6px 12px;" onclick="executeProposal('${p.id}')">Execute</button>
    </div>
  `).join('');
}

function renderAllocationBars() {
  const container = document.getElementById('allocation-bars');
  if (!container) return;

  const totals = {};
  Object.keys(CATEGORY_LIMITS).forEach(cat => { totals[cat] = 0; });
  AppState.proposals
    .filter(p => p.status === PROPOSAL_STATUS.EXECUTED || p.status === PROPOSAL_STATUS.PROOF)
    .forEach(p => { if (totals[p.category] !== undefined) totals[p.category] += p.amount; });

  const maxDisb = Math.max(...Object.values(totals), 1);
  container.innerHTML = Object.entries(CATEGORY_LIMITS).map(([name, info]) => {
    const used = totals[name] || 0;
    const pct = Math.min(100, (used / info.limit) * 100).toFixed(0);
    return `
      <div class="alloc-item">
        <div class="alloc-header">
          <span class="alloc-name">${name}</span>
          <span class="alloc-val">₹${used}L / ₹${info.limit}L</span>
        </div>
        <div class="alloc-bar">
          <div class="alloc-fill" style="width:${pct}%; background:${info.color}"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTxList() {
  const container = document.getElementById('tx-list');
  if (!container) return;
  if (AppState.transactions.length === 0) {
    container.innerHTML = '<div class="empty-state-sm">No transactions yet.</div>';
    return;
  }
  container.innerHTML = AppState.transactions.map(tx => `
    <div class="tx-item">
      <div class="tx-icon">${tx.type === 'deposit' ? '⬇️' : '⬆️'}</div>
      <div class="tx-info">
        <div class="tx-desc">${escapeHTML(tx.desc)}</div>
        <div class="tx-hash">${tx.txHash}</div>
      </div>
      <div class="tx-amount ${tx.type === 'deposit' ? 'tx-deposit' : 'tx-disburse'}">
        ${tx.type === 'deposit' ? '+' : '-'}₹${tx.amount}L
      </div>
    </div>
  `).join('');
}

// ============== AUDIT LOG ==============

function renderAuditLog() {
  const tbody = document.getElementById('audit-tbody');
  if (!tbody) return;
  if (AppState.auditLog.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No audit entries yet.</td></tr>';
    return;
  }
  tbody.innerHTML = AppState.auditLog.map(entry => `
    <tr>
      <td style="font-family:monospace; font-size:12px;">#${entry.block}</td>
      <td style="font-size:12px;">${new Date(entry.ts).toLocaleString('en-IN')}</td>
      <td><span class="audit-action">${entry.action}</span></td>
      <td><span class="audit-actor">${entry.actor}</span></td>
      <td style="max-width:200px; font-size:12px;">${escapeHTML(entry.details)}</td>
      <td><span class="audit-hash">${entry.txHash}</span></td>
    </tr>
  `).join('');
}

// ============== MODAL SYSTEM ==============

function showModal(title, bodyHTML, footerBtns = []) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-footer').innerHTML = footerBtns.map(b => b).join('');
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ============== TX OVERLAY ==============

function showTxOverlay(title, desc) {
  document.getElementById('tx-title').textContent = title;
  document.getElementById('tx-desc').textContent = desc;
  document.getElementById('tx-hash-preview').textContent = generateTxHash().substring(0, 20) + '...';
  document.getElementById('tx-overlay').classList.remove('hidden');
}

function hideTxOverlay() {
  document.getElementById('tx-overlay').classList.add('hidden');
}

// ============== TOAST ==============

function showToast(message, type = 'info', duration = 4000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-text">${escapeHTML(message)}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============== NOTIFICATIONS ==============

function showNotifications() {
  const unread = AppState.notifications.filter(n => !n.read);
  const html = AppState.notifications.length === 0
    ? '<div class="empty-state-sm">No notifications</div>'
    : AppState.notifications.map(n => `
        <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border); margin-bottom:8px; ${n.read ? 'opacity:0.5' : ''}">
          <div style="font-size:14px; color:#fff;">${escapeHTML(n.text)}</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${n.type.toUpperCase()}</div>
        </div>
      `).join('');

  AppState.notifications.forEach(n => n.read = true);
  document.getElementById('notif-count').textContent = '0';

  showModal('Notifications', html, []);
}

// ============== HELPERS ==============

function escapeHTML(str) {
  if (typeof str !== 'string') return String(str || '');
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
