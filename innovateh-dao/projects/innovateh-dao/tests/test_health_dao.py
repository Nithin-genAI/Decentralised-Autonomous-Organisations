"""HealthDAO - Smart Contract for Healthcare Funding"""

import algopy
from algopy import ARC4Contract, UInt64, String, Global, Txn
from algopy.arc4 import abimethod

class HealthDAO(ARC4Contract):
    """Main DAO contract for transparent healthcare funding"""
    
    def __init__(self) -> None:
        # State variables (stored on blockchain)
        self.proposal_count = UInt64(0)
        self.total_funds = UInt64(0)
    
    @abimethod
    def hello(self) -> String:
        """Simple test function"""
        return String("HealthDAO is ready! 🏥")
    
    @abimethod
    def get_proposal_count(self) -> UInt64:
        """Return number of proposals created"""
        return self.proposal_count
    
    @abimethod
    def get_treasury_balance(self) -> UInt64:
        """Return treasury balance"""
        return self.total_funds
    
    @abimethod
    def create_proposal(self, title: String, amount: UInt64) -> UInt64:
        """Create a new funding proposal"""
        # Increment counter
        self.proposal_count = self.proposal_count + UInt64(1)
        
        # For now, just return the ID
        # We'll add more details later
        return self.proposal_count
    
    @abimethod
    def deposit(self) -> None:
        """Receive funds into treasury"""
        # Add transaction amount to treasury
        self.total_funds = self.total_funds + Txn.amount