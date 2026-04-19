// ===== APP.JS — Entry Point & Action Handlers =====

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {
  seedDemoData();
  updateLandingStats();
  updateBlockCounter();
  setInterval(updateBlockCounter, 6000);
});

function updateBlockCounter() {
  const el = document.getElementById('block-number');
  if (el) el.textContent = AppState.blockNumber.toLocaleString('en-IN');
}

// ========== CREATE PROPOSAL FORM ==========

let currentStep = 1;

function initCreateForm() {
  currentStep = 1;
  showFormStep(1);
  resetFormStepIndicators();

  // Set min deadline to today + 1 day
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const deadline = document.getElementById('prop-deadline');
  if (deadline) deadline.min = minDate.toISOString().split('T')[0];

  // Category change → update limit display
  const catSelect = document.getElementById('prop-category');
  if (catSelect) catSelect.addEventListener('change', updateCategoryLimitDisplay);
}

function showFormStep(step) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`form-step-${i}`);
    if (el) el.classList.toggle('hidden', i !== step);
  }
}

function resetFormStepIndicators() {
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById(`step-${i}-dot`);
    if (dot) { dot.classList.remove('active', 'done'); }
  }
  const dot1 = document.getElementById('step-1-dot');
  if (dot1) dot1.classList.add('active');
}

function updateCategoryLimitDisplay() {
  const cat = document.getElementById('prop-category').value;
  const display = document.getElementById('cat-limit-display');
  if (!cat) {
    display.textContent = 'Select a category first';
    display.className = 'category-limit-display';
    return;
  }
  const info = CATEGORY_LIMITS[cat];
  const amount = parseFloat(document.getElementById('prop-amount')?.value) || 0;
  if (amount > info.limit) {
    display.textContent = `⚠️ Exceeds limit! Max ₹${info.limit}L for ${cat}`;
    display.className = 'category-limit-display over';
  } else {
    display.textContent = `✅ Max ₹${info.limit} Lakhs for ${cat}`;
    display.className = 'category-limit-display valid';
  }
}

function nextStep(step) {
  // Validate current step before proceeding
  if (step === 2 && currentStep === 1) {
    const title = document.getElementById('prop-title').value.trim();
    const desc = document.getElementById('prop-desc').value.trim();
    const cat = document.getElementById('prop-category').value;
    const pri = document.getElementById('prop-priority').value;
    if (!title || title.length < 5) { showToast('Please enter a valid title (min 5 chars)', 'error'); return; }
    if (!desc || desc.length < 20) { showToast('Description must be at least 20 characters', 'error'); return; }
    if (!cat) { showToast('Please select a category', 'error'); return; }
    if (!pri) { showToast('Please select a priority level', 'error'); return; }
  }

  if (step === 3 && currentStep === 2) {
    const amount = parseFloat(document.getElementById('prop-amount').value);
    const deadline = document.getElementById('prop-deadline').value;
    const cat = document.getElementById('prop-category').value;
    if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
    if (cat && amount > CATEGORY_LIMITS[cat].limit) {
      showToast(`Amount exceeds category limit of ₹${CATEGORY_LIMITS[cat].limit}L`, 'error'); return;
    }
    if (!deadline) { showToast('Please select a voting deadline', 'error'); return; }
    renderProposalPreview();
  }

  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById(`step-${i}-dot`);
    if (i < step) { dot.classList.remove('active'); dot.classList.add('done'); dot.textContent = '✓'; }
    else if (i === step) { dot.classList.remove('done'); dot.classList.add('active'); dot.textContent = i; }
    else { dot.classList.remove('active', 'done'); dot.textContent = i; }
  }

  currentStep = step;
  showFormStep(step);
}

function renderProposalPreview() {
  const title = document.getElementById('prop-title').value;
  const desc = document.getElementById('prop-desc').value;
  const cat = document.getElementById('prop-category').value;
  const pri = document.getElementById('prop-priority').value;
  const amount = document.getElementById('prop-amount').value;
  const deadline = document.getElementById('prop-deadline').value;
  const ipfs = document.getElementById('prop-ipfs').value;

  const preview = document.getElementById('proposal-preview');
  if (!preview) return;

  preview.innerHTML = `
    <div class="preview-row"><span class="preview-key">Title</span><span class="preview-val">${escapeHTML(title)}</span></div>
    <div class="preview-row"><span class="preview-key">Category</span><span class="preview-val">${cat}</span></div>
    <div class="preview-row"><span class="preview-key">Priority</span><span class="preview-val">${priorityEmoji(pri)} ${pri}</span></div>
    <div class="preview-row"><span class="preview-key">Amount Requested</span><span class="preview-val" style="color:var(--cyan); font-size:18px;">₹${parseFloat(amount).toLocaleString('en-IN')} Lakhs</span></div>
    <div class="preview-row"><span class="preview-key">Voting Deadline</span><span class="preview-val">${new Date(deadline).toLocaleDateString('en-IN')}</span></div>
    <div class="preview-row"><span class="preview-key">IPFS Document</span><span class="preview-val" style="font-family:monospace; font-size:12px;">${ipfs || 'No document attached'}</span></div>
    <div class="preview-row"><span class="preview-key">Proposing Hospital</span><span class="preview-val">${escapeHTML(AppState.currentUser?.name || '')}</span></div>
    <div class="preview-row"><span class="preview-key">Wallet</span><span class="preview-val" style="font-family:monospace;">${AppState.currentWallet}</span></div>
  `;
}

function simulateIPFSUpload() {
  const hash = generateIPFSHash();
  document.getElementById('prop-ipfs').value = hash;
  showToast(`📎 Document uploaded to IPFS: ${hash.substring(0,16)}...`, 'success');
}

async function submitProposal() {
  const termsChecked = document.getElementById('terms-check').checked;
  if (!termsChecked) { showToast('Please agree to the governance rules', 'error'); return; }

  if (AppState.currentRole !== 'hospital') {
    showToast('Only hospitals can create proposals', 'error'); return;
  }

  const data = {
    title: document.getElementById('prop-title').value,
    description: document.getElementById('prop-desc').value,
    category: document.getElementById('prop-category').value,
    priority: document.getElementById('prop-priority').value,
    amount: document.getElementById('prop-amount').value,
    deadline: document.getElementById('prop-deadline').value,
    ipfsHash: document.getElementById('prop-ipfs').value,
  };

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;

  showTxOverlay('Submitting Proposal...', 'Broadcasting to HealthDAO smart contract');

  try {
    await delay(2500);
    const proposal = await Blockchain.submitProposal(data);
    hideTxOverlay();
    showToast(`✅ Proposal ${proposal.id} submitted successfully!`, 'success');
    updateDashboardStats();

    // Reset form and go to proposals
    document.getElementById('prop-title').value = '';
    document.getElementById('prop-desc').value = '';
    document.getElementById('prop-category').value = '';
    document.getElementById('prop-priority').value = '';
    document.getElementById('prop-amount').value = '';
    document.getElementById('prop-deadline').value = '';
    document.getElementById('prop-ipfs').value = '';
    document.getElementById('terms-check').checked = false;

    setTimeout(() => {
      switchView('proposals');
    }, 1000);
  } catch (err) {
    hideTxOverlay();
    showToast(`❌ ${err}`, 'error');
    submitBtn.disabled = false;
  }
}

// ========== VOTING ==========

async function voteOnProposal(proposalId, vote) {
  if (AppState.currentRole !== 'official') {
    showToast('Only District Officials can vote', 'error'); return;
  }

  const voterId = AppState.currentUser.id;
  showTxOverlay(`Casting ${vote.toUpperCase()} Vote...`, 'Signing transaction with your wallet');

  try {
    await delay(1800);
    await Blockchain.castVote(proposalId, vote, voterId);
    hideTxOverlay();
    closeModal();
    showToast(`✅ ${vote.toUpperCase()} vote cast successfully!`, 'success');
    updateDashboardStats();
    renderVoteView();
    renderProposalsMiniList();
  } catch (err) {
    hideTxOverlay();
    showToast(`❌ ${err}`, 'error');
  }
}

// ========== TREASURY ACTIONS ==========

async function depositFunds() {
  const amountEl = document.getElementById('deposit-amount');
  const amount = parseFloat(amountEl?.value);
  if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }

  showTxOverlay('Depositing Funds...', 'Transferring to HealthDAO treasury contract');

  try {
    await delay(2000);
    await Blockchain.depositFunds(amount);
    hideTxOverlay();
    if (amountEl) amountEl.value = '';
    showToast(`✅ ₹${amount} Lakhs deposited to treasury!`, 'success');
    renderTreasuryView();
    updateDashboardStats();
  } catch (err) {
    hideTxOverlay();
    showToast(`❌ ${err}`, 'error');
  }
}

async function executeProposal(proposalId) {
  closeModal();
  showTxOverlay('Executing Smart Contract...', 'Releasing funds from treasury to hospital wallet');

  try {
    await delay(2500);
    const proposal = await Blockchain.executeFunds(proposalId);
    hideTxOverlay();
    showToast(`💸 ₹${proposal.amount}L successfully transferred to ${proposal.hospital}!`, 'success');
    updateDashboardStats();
    renderTreasuryView();
    renderProposalsMiniList();
  } catch (err) {
    hideTxOverlay();
    showToast(`❌ ${err}`, 'error');
  }
}

async function advanceProposal(proposalId) {
  closeModal();
  showTxOverlay('Updating Proposal Status...', 'Writing state to blockchain');

  try {
    await delay(1500);
    await Blockchain.advanceStatus(proposalId);
    hideTxOverlay();
    showToast(`✅ Proposal status updated!`, 'success');
    renderProposalsMiniList();
    updateDashboardStats();
  } catch (err) {
    hideTxOverlay();
    showToast(`❌ ${err}`, 'error');
  }
}

async function uploadProof(proposalId) {
  const proofHash = generateIPFSHash();
  closeModal();
  showTxOverlay('Uploading Proof to IPFS...', 'Storing utilization evidence on decentralized storage');

  try {
    await delay(2000);
    await Blockchain.uploadProof(proposalId, proofHash);
    hideTxOverlay();
    showToast(`📎 Utilization proof uploaded! IPFS: ${proofHash.substring(0,16)}...`, 'success');
    renderProposalsMiniList();
    renderAuditLog();
  } catch (err) {
    hideTxOverlay();
    showToast(`❌ ${err}`, 'error');
  }
}

// ========== HELPERS ==========

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== KEYBOARD SHORTCUT ==========

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    hideTxOverlay();
  }
});
