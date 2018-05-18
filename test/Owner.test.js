import { expect, assert } from 'chai';
const Owner = artifacts.require('./Owner.sol');

contract('Owner', accounts => {
    let ownerContract;

    before(async () => {
        ownerContract = await Owner.new({ from: accounts[0] });
    });

    it('the deployer of the contract should be the owner', () => {
        ownerContract
            .getOwner()
            .then(owner => {
                assert(
                    owner === accounts[0],
                    'The owner should be the address that deployed the contract'
                );
            })
            .then(done);
    });

    it('should not allow non owners to set an owner', done => {
        ownerContract
            .setOwner(accounts[1], { from: accounts[1] })
            .then(console.log)
            .catch(err => {
                assert(
                    err,
                    'It should error out when non owners attempt to modify the set owner'
                );
                done();
            });
    });

    it('should return the owner', done => {
        ownerContract
            .getOwner()
            .then(owner => {
                assert(
                    owner === accounts[0],
                    'The owner should be the address that deployed the contract'
                );
            })
            .then(done);
    });

    it('should allow the current owner to set the new owner', done => {
        ownerContract
            .setOwner(accounts[1], { from: accounts[0] })
            .then(({ logs }) => {
                assert(logs[0].event === 'OwnerSet');
                assert(logs[0].args.o === accounts[1]);
                done();
            });
    });

    it('should return the new owner', done => {
        ownerContract
            .getOwner()
            .then(newOwner => {
                assert(newOwner === accounts[1]);
            })
            .then(done);
    });
});
