// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SavingsCircle {
    struct Member {
        bool isActive;
        uint256 joinedAt;
    }

    struct Contribution {
        bool contributed;
        uint256 amount;
    }

    address public owner;
    uint256 public constant CONTRIBUTION_AMOUNT = 0.01 ether;
    uint256 public constant MAX_MEMBERS = 11;

    mapping(address => Member) public members;
    mapping(address => mapping(uint256 => Contribution)) public contributions;
    address[] public memberAddresses;
    uint256 public currentPeriod;
    uint256 public totalBalance;

    event MemberAdded(address indexed member, uint256 timestamp);
    event ContributionMade(address indexed member, uint256 period, uint256 amount);
    event PotDistributed(address indexed member, uint256 period, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender].isActive, "Not a member");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addMember(address _member) external onlyOwner {
        require(!members[_member].isActive, "Already a member");
        require(memberAddresses.length < MAX_MEMBERS, "Circle is full");
        
        members[_member] = Member({
            isActive: true,
            joinedAt: block.timestamp
        });
        memberAddresses.push(_member);
        
        emit MemberAdded(_member, block.timestamp);
    }

    function contribute() external payable onlyMember {
        require(msg.value == CONTRIBUTION_AMOUNT, "Incorrect contribution amount");
        
        uint256 period = currentPeriod;
        require(!contributions[msg.sender][period].contributed, "Already contributed this period");
        
        contributions[msg.sender][period] = Contribution({
            contributed: true,
            amount: msg.value
        });
        
        totalBalance += msg.value;
        
        emit ContributionMade(msg.sender, period, msg.value);
    }

    function distributePot(address _recipient) external onlyOwner {
        require(members[_recipient].isActive, "Recipient is not a member");
        require(totalBalance > 0, "No funds to distribute");
        
        uint256 amount = totalBalance;
        totalBalance = 0;
        
        (bool success, ) = payable(_recipient).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit PotDistributed(_recipient, currentPeriod, amount);
    }

    function advancePeriod() external onlyOwner {
        currentPeriod++;
    }

    function getMember(address _member) external view returns (bool) {
        return members[_member].isActive;
    }

    function getContribution(address _member, uint256 _period) external view returns (bool) {
        return contributions[_member][_period].contributed;
    }

    function getMemberCount() external view returns (uint256) {
        return memberAddresses.length;
    }

    function getMemberAt(uint256 _index) external view returns (address) {
        require(_index < memberAddresses.length, "Index out of bounds");
        return memberAddresses[_index];
    }

    function getPeriodBalance() external view returns (uint256) {
        uint256 periodBalance = 0;
        for (uint256 i = 0; i < memberAddresses.length; i++) {
            address member = memberAddresses[i];
            if (contributions[member][currentPeriod].contributed) {
                periodBalance += contributions[member][currentPeriod].amount;
            }
        }
        return periodBalance;
    }
}
