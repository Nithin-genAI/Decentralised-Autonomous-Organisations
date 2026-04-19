// ===== DATA.JS — Global State & Seed Data =====

const CATEGORY_LIMITS = {
  Infrastructure: { limit: 1000, color: '#7b4fff', unit: 'Lakhs' },
  Equipment:      { limit: 500,  color: '#00d4ff', unit: 'Lakhs' },
  Medicines:      { limit: 200,  color: '#10b981', unit: 'Lakhs' },
  Staffing:       { limit: 300,  color: '#f59e0b', unit: 'Lakhs' },
  Technology:     { limit: 400,  color: '#3b82f6', unit: 'Lakhs' },
  Research:       { limit: 250,  color: '#ec4899', unit: 'Lakhs' },
};

const GOVERNANCE = {
  minQuorum: 3,
  highValueQuorum: 4,
  highValueThreshold: 500, // lakhs
  approvalThreshold: 0.60, // 60% YES
  votingPeriodDays: 7,
  timeLockHours: 48,
};

const REGISTERED_VOTERS = [
  { id: 'v1', name: 'Dr. Rajan Mehta',     addr: '0xOf...7a2', district: 'Central' },
  { id: 'v2', name: 'Mrs. Priya Sharma',    addr: '0xOf...3b8', district: 'North' },
  { id: 'v3', name: 'Mr. Arun Pillai',      addr: '0xOf...5c1', district: 'South' },
  { id: 'v4', name: 'Dr. Sunita Tiwari',    addr: '0xOf...9d4', district: 'East' },
  { id: 'v5', name: 'Mr. Vivek Narayanan',  addr: '0xOf...2e7', district: 'West' },
];

const HOSPITALS = [
  { id: 'h1', name: 'District General Hospital', addr: '0xHs...9b4', district: 'Central' },
  { id: 'h2', name: 'St. Mary\'s Medical Centre', addr: '0xHs...4f2', district: 'North' },
  { id: 'h3', name: 'Rajiv Gandhi Civil Hospital', addr: '0xHs...1a8', district: 'South' },
];

// Application State
const AppState = {
  currentRole: null,       // 'admin' | 'official' | 'voter'
  currentWallet: null,
  currentUser: null,
  treasury: 0,             // in Lakhs
  proposals: [],
  auditLog: [],
  transactions: [],
  notifications: [],
  blockNumber: 14892031,
};

// Proposal lifecycle
const PROPOSAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REVIEW: 'review',
  VOTING: 'voting',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXECUTED: 'executed',
  PROOF: 'proof',
};

// Seed data for demo
function seedDemoData() {
  const now = Date.now();
  const day = 86400000;

  AppState.treasury = 5000; // 5000 Lakhs = ₹50 Crore

  AppState.proposals = [
    {
      id: 'prop-001',
      title: 'ICU Expansion — District General Hospital',
      description: 'Expanding the ICU from 20 to 50 beds to handle the growing critical patient load post-COVID. New ventilators, monitoring equipment, and isolation rooms are included in this request.',
      category: 'Infrastructure',
      priority: 'Emergency',
      amount: 850,
      hospital: 'District General Hospital',
      hospitalId: 'h1',
      walletAddr: '0xHs...9b4',
      ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      deadline: new Date(now + 3 * day).toISOString().split('T')[0],
      status: PROPOSAL_STATUS.VOTING,
      votes: { yes: ['v1','v3'], no: ['v2'], abstain: [] },
      submittedAt: new Date(now - 4 * day).toISOString(),
      blockCreated: 14891200,
      proofHash: null,
    },
    {
      id: 'prop-002',
      title: 'Digital X-Ray & MRI Equipment Upgrade',
      description: 'Replacing the 12-year-old analog X-ray machines with digital radiography systems and installing a new 1.5T MRI machine to improve diagnostic accuracy and reduce patient wait times.',
      category: 'Equipment',
      priority: 'Routine',
      amount: 320,
      hospital: "St. Mary's Medical Centre",
      hospitalId: 'h2',
      walletAddr: '0xHs...4f2',
      ipfsHash: 'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRoz7aRPAoJFDMcw',
      deadline: new Date(now + 5 * day).toISOString().split('T')[0],
      status: PROPOSAL_STATUS.VOTING,
      votes: { yes: ['v1','v2','v4'], no: [], abstain: [] },
      submittedAt: new Date(now - 2 * day).toISOString(),
      blockCreated: 14891800,
      proofHash: null,
    },
    {
      id: 'prop-003',
      title: 'Essential Medicines Stockpile — Q2',
      description: 'Quarterly procurement of essential medicines including antibiotics, anti-hypertensives, insulin, and emergency drugs for 3 district hospitals.',
      category: 'Medicines',
      priority: 'Planned',
      amount: 150,
      hospital: 'Rajiv Gandhi Civil Hospital',
      hospitalId: 'h3',
      walletAddr: '0xHs...1a8',
      ipfsHash: 'QmT4AeWhxgTs8r6zZUFpkv9JHhZDMBqnp3pBaYtN3bKUEM',
      deadline: new Date(now - 1 * day).toISOString().split('T')[0],
      status: PROPOSAL_STATUS.APPROVED,
      votes: { yes: ['v1','v2','v3','v4'], no: [], abstain: [] },
      submittedAt: new Date(now - 10 * day).toISOString(),
      blockCreated: 14890500,
      proofHash: null,
      approvedAt: new Date(now - 1 * day).toISOString(),
    },
    {
      id: 'prop-004',
      title: 'Hospital Management Software (HMIS)',
      description: 'Implementation of a cloud-based Hospital Management Information System to digitize patient records, billing, pharmacy, and lab management across all 5 district hospitals.',
      category: 'Technology',
      priority: 'Planned',
      amount: 380,
      hospital: 'District General Hospital',
      hospitalId: 'h1',
      walletAddr: '0xHs...9b4',
      ipfsHash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345ggfHLLibkTHU8kk',
      deadline: new Date(now - 5 * day).toISOString().split('T')[0],
      status: PROPOSAL_STATUS.EXECUTED,
      votes: { yes: ['v1','v2','v3'], no: ['v5'], abstain: [] },
      submittedAt: new Date(now - 15 * day).toISOString(),
      blockCreated: 14889200,
      proofHash: 'QmProofHMIS2024AbcDef123456789XYZ',
      approvedAt: new Date(now - 6 * day).toISOString(),
      executedAt: new Date(now - 3 * day).toISOString(),
    },
    {
      id: 'prop-005',
      title: 'Nurse Recruitment Drive — 200 Positions',
      description: 'Emergency recruitment of 200 staff nurses across district hospitals to address the critical shortage following the retirement wave and increased patient volumes.',
      category: 'Staffing',
      priority: 'Emergency',
      amount: 280,
      hospital: "St. Mary's Medical Centre",
      hospitalId: 'h2',
      walletAddr: '0xHs...4f2',
      ipfsHash: '',
      deadline: new Date(now + 1 * day).toISOString().split('T')[0],
      status: PROPOSAL_STATUS.SUBMITTED,
      votes: { yes: [], no: [], abstain: [] },
      submittedAt: new Date(now - 1 * day).toISOString(),
      blockCreated: 14892000,
      proofHash: null,
    },
    {
      id: 'prop-006',
      title: 'Cancer Research Grant — Oncology Wing',
      description: 'Funding for a 2-year cancer research program focusing on early detection biomarkers for cervical and oral cancers prevalent in the district population.',
      category: 'Research',
      priority: 'Routine',
      amount: 200,
      hospital: 'Rajiv Gandhi Civil Hospital',
      hospitalId: 'h3',
      walletAddr: '0xHs...1a8',
      ipfsHash: '',
      deadline: new Date(now - 2 * day).toISOString().split('T')[0],
      status: PROPOSAL_STATUS.REJECTED,
      votes: { yes: ['v1'], no: ['v2','v3','v4'], abstain: [] },
      submittedAt: new Date(now - 12 * day).toISOString(),
      blockCreated: 14890100,
      proofHash: null,
    },
  ];

  // Audit log (seed)
  AppState.auditLog = [
    { block: 14888000, ts: new Date(now - 20 * day).toISOString(), action: 'CONTRACT_DEPLOYED', actor: '0xAd...3f1', details: 'HealthDAO smart contract initialized', txHash: '0x' + randomHex(64) },
    { block: 14889000, ts: new Date(now - 18 * day).toISOString(), action: 'TREASURY_DEPOSIT', actor: '0xAd...3f1', details: '₹5000 Lakhs deposited', txHash: '0x' + randomHex(64) },
    { block: 14889200, ts: new Date(now - 15 * day).toISOString(), action: 'PROPOSAL_SUBMITTED', actor: '0xHs...9b4', details: 'Proposal prop-004: HMIS', txHash: '0x' + randomHex(64) },
    { block: 14890100, ts: new Date(now - 12 * day).toISOString(), action: 'PROPOSAL_SUBMITTED', actor: '0xHs...1a8', details: 'Proposal prop-006: Cancer Research', txHash: '0x' + randomHex(64) },
    { block: 14890200, ts: new Date(now - 11 * day).toISOString(), action: 'VOTE_CAST', actor: '0xOf...7a2', details: 'YES vote on prop-004', txHash: '0x' + randomHex(64) },
    { block: 14890300, ts: new Date(now - 11 * day).toISOString(), action: 'VOTE_CAST', actor: '0xOf...3b8', details: 'YES vote on prop-004', txHash: '0x' + randomHex(64) },
    { block: 14890400, ts: new Date(now - 10 * day).toISOString(), action: 'VOTE_CAST', actor: '0xOf...5c1', details: 'YES vote on prop-004', txHash: '0x' + randomHex(64) },
    { block: 14890500, ts: new Date(now - 10 * day).toISOString(), action: 'PROPOSAL_SUBMITTED', actor: '0xHs...1a8', details: 'Proposal prop-003: Medicines', txHash: '0x' + randomHex(64) },
    { block: 14891000, ts: new Date(now - 6 * day).toISOString(), action: 'PROPOSAL_APPROVED', actor: 'SMART_CONTRACT', details: 'prop-004 met quorum & threshold', txHash: '0x' + randomHex(64) },
    { block: 14891100, ts: new Date(now - 5 * day).toISOString(), action: 'PROPOSAL_REJECTED', actor: 'SMART_CONTRACT', details: 'prop-006 failed threshold (25% YES)', txHash: '0x' + randomHex(64) },
    { block: 14891200, ts: new Date(now - 4 * day).toISOString(), action: 'PROPOSAL_SUBMITTED', actor: '0xHs...9b4', details: 'Proposal prop-001: ICU Expansion', txHash: '0x' + randomHex(64) },
    { block: 14891300, ts: new Date(now - 3 * day).toISOString(), action: 'FUNDS_EXECUTED', actor: '0xAd...3f1', details: '₹380 Lakhs released for prop-004', txHash: '0x' + randomHex(64) },
    { block: 14891400, ts: new Date(now - 3 * day).toISOString(), action: 'PROOF_UPLOADED', actor: '0xHs...9b4', details: 'IPFS proof uploaded for prop-004', txHash: '0x' + randomHex(64) },
    { block: 14891800, ts: new Date(now - 2 * day).toISOString(), action: 'PROPOSAL_SUBMITTED', actor: '0xHs...4f2', details: 'Proposal prop-002: MRI Equipment', txHash: '0x' + randomHex(64) },
    { block: 14892000, ts: new Date(now - 1 * day).toISOString(), action: 'PROPOSAL_SUBMITTED', actor: '0xHs...4f2', details: 'Proposal prop-005: Nurse Recruitment', txHash: '0x' + randomHex(64) },
  ];

  AppState.transactions = [
    { type: 'deposit', amount: 5000, desc: 'State Treasury Initial Deposit', actor: '0xAd...3f1', ts: new Date(now - 18 * day).toISOString(), txHash: '0x' + randomHex(16) },
    { type: 'disburse', amount: 380, desc: 'Funds released: HMIS (prop-004)', actor: 'SMART_CONTRACT', ts: new Date(now - 3 * day).toISOString(), txHash: '0x' + randomHex(16) },
  ];

  AppState.treasury -= 380; // deduct executed amount

  AppState.notifications = [
    { id: 'n1', text: 'prop-001 ICU Expansion is awaiting your vote', type: 'vote', read: false },
    { id: 'n2', text: 'prop-003 Medicines has been approved — ready to execute', type: 'action', read: false },
    { id: 'n3', text: 'prop-005 Nurse Recruitment submitted for review', type: 'info', read: false },
  ];
}

function randomHex(len) {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < len; i++) result += chars[Math.floor(Math.random() * 16)];
  return result;
}

function generateTxHash() {
  return '0x' + randomHex(64);
}

function generateIPFSHash() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = 'Qm';
  for (let i = 0; i < 44; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
