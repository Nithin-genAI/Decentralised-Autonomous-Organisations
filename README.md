# 🏥 HealthDAO - Decentralized Healthcare Funding System

A transparent, blockchain-based DAO (Decentralized Autonomous Organization) for managing public healthcare funds. Eliminates corruption through immutable smart contracts, multi-sig governance, and automated fund release mechanisms.

![HealthDAO Banner](https://img.shields.io/badge/Blockchain-Ethereum%20%7C%20Algorand-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)

## 🌟 Features

### Core Governance
- **Multi-Role Access Control**: State Admin, District Officials, Hospitals
- **Proposal System**: Hospitals submit funding requests with IPFS document proofs
- **Democratic Voting**: District officials vote with quorum requirements
- **Time-Lock Security**: 48-hour delay before fund execution
- **Anti-Corruption**: Automated rules prevent fraudulent transactions

### Smart Contract Rules
| Rule | Value |
|------|-------|
| Minimum Quorum | 3 voters |
| Approval Threshold | 60% YES votes |
| High-Value Quorum (>₹5Cr) | 4 voters |
| Voting Period | 7 days |
| Time-Lock Duration | 48 hours post-approval |

### Category Budget Limits
- 🏗️ Infrastructure: ₹500 Lakhs
- 🔬 Equipment: ₹300 Lakhs
- 💊 Medicines: ₹200 Lakhs
- 👨‍⚕️ Staffing: ₹150 Lakhs
- 💻 Technology: ₹100 Lakhs
- 🧬 Research: ₹250 Lakhs


## 🚀 Quick Start

### HealthDAO (Frontend Demo)

```bash
cd HealthDAO

# Install Hardhat dependencies
npm install

# Run local server
python3 -m http.server 8080

# Open http://localhost:8080

Demo Wallets:

Role	Address	Access
State Admin	0xAd...3f1	Treasury management
District Official	0xOf...7a2	Voting
Hospital	0xHs...9b4	Create proposals
innovateh-dao (Algorand Smart Contracts)
Prerequisites:

Python 3.12+
Docker (for LocalNet)
AlgoKit CLI
bash
cd innovateh-dao/projects/innovateh-dao
 
# Bootstrap environment
algokit project bootstrap all
 
# Configure environment
algokit generate env-file -a target_network localnet
 
# Start local Algorand network
algokit localnet start
 
# Build contracts
algokit project run build
 
# Deploy to localnet
algokit project deploy localnet
🎨 UI Highlights
Glassmorphism Design: Modern translucent UI with gradient accents
Real-time Blockchain Simulation: Live block counter, transaction previews
Interactive Flow: Proposal → Vote → Execute fund release
Audit Trail: Immutable transaction history with timestamps
Responsive Layout: Works on desktop and mobile
🔒 Security Features
Role-Based Access Control: Only authorized wallets can perform actions
Quorum Requirements: Minimum voters needed for decisions
Category Limits: Prevents overspending in any category
IPFS Integration: Document proofs stored on decentralized storage
Time-Lock: Funds can't be released immediately (prevents rush attacks)
🛠️ Tech Stack
Component	Technology
Frontend	HTML5, CSS3, Vanilla JavaScript
Styling	CSS Grid, Flexbox, CSS Variables
Blockchain (Demo)	Hardhat, Ethers.js
Smart Contracts (Prod)	Algorand Python (Puya)
Storage	IPFS (simulated)
Testing	AlgoKit Utils
📊 Workflow
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Hospital  │────▶│   Create    │────▶│   Voting    │
│  (Proposer) │     │  Proposal   │     │   Period    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                       ┌────────────────────────┘
                       ▼
              ┌─────────────┐     ┌─────────────┐
              │   Quorum    │────▶│   Execute   │
              │   Reached?  │     │   Funds     │
              └─────────────┘     └──────┬──────┘
                                         │
                              ┌──────────┴──────────┐
                              ▼                     ▼
                       ┌─────────────┐       ┌─────────────┐
                       │   Approved  │       │  Rejected   │
                       │  (Release)  │       │  (Refund)   │
                       └─────────────┘       └─────────────┘
📝 Smart Contract Methods
HealthDAO Contract
submitProposal(title, desc, category, priority, amount, deadline, ipfsHash)
castVote(proposalId, vote, voterId)
executeFunds(proposalId)
depositFunds(amount)
advanceStatus(proposalId)
uploadProof(proposalId, proofHash)
🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is licensed under the MIT License.

🙏 Acknowledgments
AlgoKit for Algorand development tools
Hardhat for Ethereum development environment
Algorand Foundation for blockchain infrastructure
Made with ❤️ for transparent healthcare governance
