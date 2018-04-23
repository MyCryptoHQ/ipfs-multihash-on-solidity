pragma solidity ^0.4.18;

contract Owner {

    address private owner;
    
    event OwnerSet (
        address o
    );

    constructor() public {
        owner = msg.sender;
    }

    function setOwner(address newOwner) 
    public
    {
        onlyOwner();
        owner = newOwner;
        emit OwnerSet(owner);
    }

    function getOwner() 
    view
    public 
    returns (address o)
    {
        return owner;
    }

    function onlyOwner() 
    view
    internal
    returns (bool) {
        if (msg.sender != owner){
           
            revert("Only the contract owner can access this function");
        }
        return true;

    }

}