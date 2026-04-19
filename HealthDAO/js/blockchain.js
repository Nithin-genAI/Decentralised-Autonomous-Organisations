// ===== BLOCKCHAIN.JS — Smart Contract Simulation Layer =====

const Blockchain = {

  // ============== PROPOSAL FUNCTIONS ==============

  submitProposal(data) {
    return new Promise((resolve, reject) => {
      // Validate category limit
      const catLimit = CATEGORY_LIMITS[data.category];
      if (!catLimit) return reject('Invalid category');
      if (data.amount > catLimit.limit) {
        return reject(`Amount ₹${data.amount}L exceeds category limit of ₹${catLimit.limit}L for ${data.category}`);
      }
      if (data.amount <= 0) return reject('Amount must be greater than 0');
      if (!data.title || data.title.trim().length < 5) return reject('Title must be at least 5 characters');
      if (!data.description || data.description.trim().length < 20) return reject('Description must be at least 20 characters');

      const newProposal = {
        id: 'prop-' + String(AppState.proposals.length + 1).padStart(3, '0'),
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        priority: data.priority,
        amount: parseFloat(data.amount),
        hospital: AppState.currentUser.name,
        hospitalId: AppState.currentUser.id,
        walletAddr: AppState.currentWallet,
        ipfsHash: data.ipfsHash || '',
        deadline: data.deadline,
        status: PROPOSAL_STATUS.SUBMITTED,
        votes: { yes: [], no: [], abstain: [] },
        submittedAt: new Date().toISOString(),
        blockCreated: AppState.blockNumber + Math.floor(Math.random() * 100),
        proofHash: null,
      };

      AppState.proposals.unshift(newProposal);
      AppState.blockNumber += Math.floor(Math.random() * 50) + 10;

      Blockchain._addAuditEntry('PROPOSAL_SUBMITTED', AppState.currentWallet,
        `Proposal ${newProposal.id}: ${newProposal.title.substring(0, 40)}`);

      addActivity('📋', `New proposal submitted`, `${newProposal.title} by ${newProposal.hospital}`);

      // Auto-move to review then voting (simulate chain lifecycle)
      setTimeout(() => {
        newProposal.status = PROPOSAL_STATUS.REVIEW;
        Blockchain._addAuditEntry('STATUS_UPDATE', 'SMART_CONTRACT', `${newProposal.id} moved to Under Review`);
        setTimeout(() => {
          newProposal.status = PROPOSAL_STATUS.VOTING;
          Blockchain._addAuditEntry('VOTING_STARTED', 'SMART_CONTRACT', `${newProposal.id} voting period opened`);
          addActivity('🗳️', 'Voting opened', `${newProposal.title}`);
          updateDashboardStats();
          renderProposalsMiniList();
        }, 1500);
        updateDashboardStats();
      }, 1000);

      resolve(newProposal);
    });
  },

  // ============== VOTING FUNCTIONS ==============

  castVote(proposalId, vote, voterId) {
    return new Promise((resolve, reject) => {
      const proposal = AppState.proposals.find(p => p.id === proposalId);
      if (!proposal) return reject('Proposal not found');
      if (proposal.status !== PROPOSAL_STATUS.VOTING) return reject('Proposal is not in voting phase');
      
      // Check deadline
      const deadline = new Date(proposal.deadline);
      const now = new Date();
      if (now > deadline) return reject('Voting period has ended');

      // Check double voting
      const allVoters = [...proposal.votes.yes, ...proposal.votes.no, ...proposal.votes.abstain];
      if (allVoters.includes(voterId)) return reject('You have already voted on this proposal');

      // Check voter eligibility
      const isRegisteredVoter = REGISTERED_VOTERS.find(v => v.id === voterId);
      if (!isRegisteredVoter) return reject('Wallet not registered as voter');

      // Cast vote
      if (vote === 'yes') proposal.votes.yes.push(voterId);
      else if (vote === 'no') proposal.votes.no.push(voterId);
      else proposal.votes.abstain.push(voterId);

      AppState.blockNumber += Math.floor(Math.random() * 20) + 5;

      const voter = REGISTERED_VOTERS.find(v => v.id === voterId);
      Blockchain._addAuditEntry('VOTE_CAST', voter?.addr || voterId,
        `${vote.toUpperCase()} vote on ${proposalId}`);

      addActivity('🗳️', `Vote cast`, `${voter?.name} voted ${vote.toUpperCase()} on ${proposal.title.substring(0,30)}`);

      // Check if quorum and threshold are met
      Blockchain._checkProposalOutcome(proposal);

      resolve({ vote, proposalId });
    });
  },

  _checkProposalOutcome(proposal) {
    const totalVotes = proposal.votes.yes.length + proposal.votes.no.length;
    const requiredQuorum = proposal.amount > GOVERNANCE.highValueThreshold
      ? GOVERNANCE.highValueQuorum : GOVERNANCE.minQuorum;
    
    const deadline = new Date(proposal.deadline);
    const now = new Date();

    if (now > deadline && totalVotes >= requiredQuorum) {
      const yesRatio = proposal.votes.yes.length / (totalVotes || 1);
      if (yesRatio >= GOVERNANCE.approvalThreshold) {
        proposal.status = PROPOSAL_STATUS.APPROVED;
        proposal.approvedAt = new Date().toISOString();
        Blockchain._addAuditEntry('PROPOSAL_APPROVED', 'SMART_CONTRACT',
          `${proposal.id} approved (${Math.round(yesRatio*100)}% YES, ${totalVotes} votes)`);
        addActivity('✅', 'Proposal Approved', proposal.title.substring(0,40));
      } else {
        proposal.status = PROPOSAL_STATUS.REJECTED;
        Blockchain._addAuditEntry('PROPOSAL_REJECTED', 'SMART_CONTRACT',
          `${proposal.id} rejected (${Math.round(yesRatio*100)}% YES — below threshold)`);
        addActivity('❌', 'Proposal Rejected', proposal.title.substring(0,40));
      }
    }
  },

  // ============== TREASURY FUNCTIONS ==============

  depositFunds(amountLakhs) {
    return new Promise((resolve, reject) => {
      if (AppState.currentRole !== 'admin') return reject('Only State Admin can deposit funds');
      if (amountLakhs <= 0) return reject('Amount must be positive');

      AppState.treasury += parseFloat(amountLakhs);
      AppState.blockNumber += 20;

      AppState.transactions.unshift({
        type: 'deposit',
        amount: amountLakhs,
        desc: 'Treasury Deposit by State Admin',
        actor: AppState.currentWallet,
        ts: new Date().toISOString(),
        txHash: generateTxHash().substring(0, 18) + '...',
      });

      Blockchain._addAuditEntry('TREASURY_DEPOSIT', AppState.currentWallet,
        `₹${amountLakhs} Lakhs deposited to treasury`);
      addActivity('💰', 'Treasury Deposit', `₹${amountLakhs} Lakhs added by State Admin`);

      resolve(AppState.treasury);
    });
  },

  executeFunds(proposalId) {
    return new Promise((resolve, reject) => {
      if (AppState.currentRole !== 'admin') return reject('Only State Admin can execute fund transfers');

      const proposal = AppState.proposals.find(p => p.id === proposalId);
      if (!proposal) return reject('Proposal not found');
      if (proposal.status !== PROPOSAL_STATUS.APPROVED) return reject('Proposal must be approved before execution');

      // Time-lock check (simulated — check if deadline + 48h has passed)
      const deadline = new Date(proposal.deadline);
      const timeLockExpiry = new Date(deadline.getTime() + GOVERNANCE.timeLockHours * 3600000);
      const now = new Date();
      if (now < timeLockExpiry && proposal.status !== PROPOSAL_STATUS.EXECUTED) {
        // For demo: allow execution after approval for pre-seeded data
        // In real case: if (now < timeLockExpiry) return reject(...)
      }

      if (AppState.treasury < proposal.amount) {
        return reject(`Insufficient treasury balance. Available: ₹${AppState.treasury}L, Required: ₹${proposal.amount}L`);
      }

      AppState.treasury -= proposal.amount;
      proposal.status = PROPOSAL_STATUS.EXECUTED;
      proposal.executedAt = new Date().toISOString();
      AppState.blockNumber += 30;

      AppState.transactions.unshift({
        type: 'disburse',
        amount: proposal.amount,
        desc: `Funds released: ${proposal.title.substring(0, 40)}`,
        actor: 'SMART_CONTRACT',
        ts: new Date().toISOString(),
        txHash: generateTxHash().substring(0, 18) + '...',
      });

      Blockchain._addAuditEntry('FUNDS_EXECUTED', AppState.currentWallet,
        `₹${proposal.amount}L released to ${proposal.hospital} for ${proposalId}`);
      addActivity('💸', 'Funds Executed', `₹${proposal.amount}L sent to ${proposal.hospital}`);

      resolve(proposal);
    });
  },

  // ============== PROOF UPLOAD ==============

  uploadProof(proposalId, proofHash) {
    return new Promise((resolve, reject) => {
      const proposal = AppState.proposals.find(p => p.id === proposalId);
      if (!proposal) return reject('Proposal not found');
      if (proposal.status !== PROPOSAL_STATUS.EXECUTED) return reject('Proof can only be uploaded after fund execution');
      if (proposal.hospitalId !== AppState.currentUser?.id && AppState.currentRole !== 'admin') {
        return reject('Only the proposing hospital can upload proof');
      }

      proposal.proofHash = proofHash;
      proposal.status = PROPOSAL_STATUS.PROOF;
      AppState.blockNumber += 10;

      Blockchain._addAuditEntry('PROOF_UPLOADED', AppState.currentWallet,
        `Utilization proof uploaded for ${proposalId}: ${proofHash.substring(0,20)}...`);
      addActivity('📎', 'Proof Uploaded', `IPFS proof attached to ${proposal.title.substring(0,30)}`);

      resolve(proposal);
    });
  },

  // ============== ADMIN: ADVANCE PROPOSAL STATUS MANUALLY ==============

  advanceStatus(proposalId) {
    return new Promise((resolve, reject) => {
      if (AppState.currentRole !== 'admin') return reject('Admin only');
      const proposal = AppState.proposals.find(p => p.id === proposalId);
      if (!proposal) return reject('Not found');

      const flow = [PROPOSAL_STATUS.SUBMITTED, PROPOSAL_STATUS.REVIEW, PROPOSAL_STATUS.VOTING];
      const idx = flow.indexOf(proposal.status);
      if (idx === -1) return reject('Cannot manually advance from current status');

      const next = flow[idx + 1];
      if (!next) return reject('Already in final advancing state');
      proposal.status = next;
      AppState.blockNumber += 10;
      Blockchain._addAuditEntry('STATUS_ADVANCED', AppState.currentWallet, `${proposalId} → ${next}`);
      resolve(proposal);
    });
  },

  // ============== AUDIT LOG ==============

  _addAuditEntry(action, actor, details) {
    AppState.auditLog.unshift({
      block: AppState.blockNumber,
      ts: new Date().toISOString(),
      action,
      actor,
      details,
      txHash: generateTxHash().substring(0, 18) + '...',
    });
    renderAuditLog();
  },

  // ============== GETTERS ==============

  getProposalVoteSummary(proposal) {
    const yes = proposal.votes.yes.length;
    const no = proposal.votes.no.length;
    const total = yes + no;
    const quorum = proposal.amount > GOVERNANCE.highValueThreshold
      ? GOVERNANCE.highValueQuorum : GOVERNANCE.minQuorum;
    return { yes, no, total, quorum, meetsQuorum: total >= quorum };
  },

  hasVoted(proposal, voterId) {
    return (
      proposal.votes.yes.includes(voterId) ||
      proposal.votes.no.includes(voterId) ||
      proposal.votes.abstain.includes(voterId)
    );
  },

  getVoterChoice(proposal, voterId) {
    if (proposal.votes.yes.includes(voterId)) return 'yes';
    if (proposal.votes.no.includes(voterId)) return 'no';
    if (proposal.votes.abstain.includes(voterId)) return 'abstain';
    return null;
  },
};
