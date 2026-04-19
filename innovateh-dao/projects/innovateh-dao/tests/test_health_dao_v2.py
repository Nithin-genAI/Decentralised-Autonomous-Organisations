"""Tests for HealthDAO using AlgoKit 2.10.2"""

import pytest
from algopy import UInt64, String
from algopy_testing import AlgopyTestContext, algopy_testing_context

@pytest.fixture()
def context() -> AlgopyTestContext:
    """Create test context for AlgoKit 2.10.2"""
    with algopy_testing_context() as ctx:
        yield ctx

def test_contract_initialization(context: AlgopyTestContext):
    """Test that contract initializes correctly"""
    from smart_contracts.health_dao.health_dao import HealthDAO
    
    # Create contract instance
    contract = HealthDAO()
    
    # Test initial values
    assert contract.proposal_count == 0
    assert contract.total_funds == 0
    
    print("✓ Contract initialized correctly")

def test_hello_function(context: AlgopyTestContext):
    """Test hello function"""
    from smart_contracts.health_dao.health_dao import HealthDAO
    
    contract = HealthDAO()
    result = contract.hello()
    
    assert "HealthDAO" in str(result)
    print(f"✓ Hello function: {result}")

def test_create_proposal(context: AlgopyTestContext):
    """Test creating a proposal"""
    from smart_contracts.health_dao.health_dao import HealthDAO
    
    contract = HealthDAO()
    
    # Create first proposal
    proposal_id = contract.create_proposal(
        String("New X-Ray Machine"),
        UInt64(100000)
    )
    
    assert proposal_id == 1
    assert contract.proposal_count == 1
    
    # Create second proposal
    proposal_id = contract.create_proposal(
        String("Emergency Medicines"),
        UInt64(50000)
    )
    
    assert proposal_id == 2
    assert contract.proposal_count == 2
    
    print(f"✓ Created {contract.proposal_count} proposals")

def test_deposit_funds(context: AlgopyTestContext):
    """Test depositing funds"""
    from smart_contracts.health_dao.health_dao import HealthDAO
    
    contract = HealthDAO()
    
    # Initial balance should be 0
    assert contract.total_funds == 0
    
    print("✓ Deposit function ready (will test with actual transactions later)")

def test_full_workflow(context: AlgopyTestContext):
    """Test complete workflow"""
    from smart_contracts.health_dao.health_dao import HealthDAO
    
    contract = HealthDAO()
    
    # Step 1: Create proposal
    proposal_id = contract.create_proposal(
        String("ICU Equipment"),
        UInt64(200000)
    )
    
    # Step 2: Check proposal count
    assert contract.get_proposal_count() == 1
    
    # Step 3: Check treasury (initially 0)
    assert contract.get_treasury_balance() == 0
    
    print("✓ Complete workflow test passed")
    print(f"  - Created proposal #{proposal_id}")
    print(f"  - Total proposals: {contract.proposal_count}")
    print(f"  - Treasury: {contract.total_funds} microAlgos")

if __name__ == "__main__":
    print("\n🏥 Running HealthDAO Tests\n" + "="*40)
    
    # Create a simple mock context
    class MockContext:
        pass
    
    # Run tests manually
    test_contract_initialization(MockContext())
    test_hello_function(MockContext())
    test_create_proposal(MockContext())
    test_deposit_funds(MockContext())
    test_full_workflow(MockContext())
    
    print("\n" + "="*40)
    print("✅ All tests passed!")