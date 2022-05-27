// SPDX-License-Identifier: MIT

pragma solidity 0.8;

import "hardhat/console.sol";

contract RoomBooking {
    struct Slot {
        address owner;
        bool isApproved;
        uint companyId;
        uint roomId;
        uint hour;
    }
    struct Employee {
        uint companyId;
        bool isAdministrator;
    }
    mapping(address => Employee) public employees;
    // companyId => roomId => hour => Slot
    mapping(uint => mapping(uint => mapping(uint => Slot))) public capacity;

    modifier onlyCompanyAdministrator() {
        uint companyId = employees[msg.sender].companyId;
        require(employees[msg.sender].isAdministrator == true, "Employee must be administrator");
        require(employees[msg.sender].companyId == companyId, "Employee must belong to company");
        _;
    }

    constructor(address[] memory administrators) {
        for (uint i = 0; i < administrators.length; i++) {
            employees[administrators[i]] = Employee({companyId: i + 1, isAdministrator: true});
        }
    }

    function addEmployee(address employeeAddress, bool isAdministrator) onlyCompanyAdministrator() public {
        uint companyId = employees[msg.sender].companyId;
        employees[employeeAddress] = Employee({companyId: companyId, isAdministrator: isAdministrator});
    }

    function removeEmployee(address employeeAddress) onlyCompanyAdministrator() public {
        delete employees[employeeAddress];
    }

    function book(uint companyId, uint roomId, uint hour) public {
        require(!capacity[companyId][roomId][hour].isApproved, "Already booked");
        bool isApproved = employees[msg.sender].companyId == companyId;
        capacity[companyId][roomId][hour] = Slot({
        owner: msg.sender,
        isApproved: isApproved,
        companyId: companyId,
        roomId: roomId,
        hour: hour
        });
    }

    function cancel(uint companyId, uint roomId, uint hour) public {
        bool isAdministrator = employees[msg.sender].companyId == companyId && employees[msg.sender].isAdministrator;
        bool isOwner = capacity[companyId][roomId][hour].owner == msg.sender;
        require(isAdministrator || isOwner, "Must be administrator or slot owner");
        delete capacity[companyId][roomId][hour];
    }

    function approve(uint roomId, uint hour) onlyCompanyAdministrator() public {
        uint companyId = employees[msg.sender].companyId;
        capacity[companyId][roomId][hour].isApproved = true;
    }

    function reject(uint roomId, uint hour) onlyCompanyAdministrator() public {
        uint companyId = employees[msg.sender].companyId;
        delete capacity[companyId][roomId][hour];
    }

    function getEmployee(address employeeAddress) public view returns(Employee memory) {
        return employees[employeeAddress];
    }

    function getSlot(uint companyId, uint roomId, uint hour) public view returns(Slot memory) {
        return capacity[companyId][roomId][hour];
    }
}
