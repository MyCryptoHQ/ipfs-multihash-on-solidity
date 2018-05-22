import { expect, assert } from 'chai';
import {
    getBytes32FromMultihash,
    getMultihashFromContractResponse
} from '../src/multihash';
import assertRevert from './helpers/assertRevert';
import expectEvent from './helpers/expectEvent';

const IPFSStorage = artifacts.require('./IPFSStorage.sol');

contract('IPFSStorage', accounts => {
    let ipfsStorage;

    beforeEach(async () => {
        ipfsStorage = await IPFSStorage.new({ from: accounts[0] });
    });

    const ipfsHashes = [
        'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8',
        'Qmb4atcgbbN5v4CDJ8nz5QG5L2pgwSTLd3raDrnyhLjnUH'
    ];

    async function setIPFSHash(key, account, hash) {
        const { digest, hashFunction, size } = getBytes32FromMultihash(hash);
        return ipfsStorage.setEntry(key, digest, hashFunction, size, {
            from: account
        });
    }

    async function getIPFSHash(key) {
        return getMultihashFromContractResponse(
            await ipfsStorage.getEntry(key)
        );
    }

    it('should get an IPFS hash after setting', async () => {
        await setIPFSHash(1, accounts[0], ipfsHashes[0]);

        expect(await getIPFSHash(1, accounts[0])).to.equal(ipfsHashes[0]);
    });

    it('should allow to set multiple hashes from the same account', async () => {
        await setIPFSHash(2, accounts[0], ipfsHashes[1]);
        expect(await getIPFSHash(2, accounts[0])).to.equal(ipfsHashes[1]);
    });

    it('should fire event when a new hash has is set', async () => {
        await expectEvent(
            setIPFSHash(1, accounts[0], ipfsHashes[0]),
            'EntrySet'
        );
    });

    it('should fail to set a hash for a non owner', async () => {
        try {
            await setIPFSHash(1, accounts[1], ipfsHashes[1]);
        } catch (e) {
            return assert.exists(e);
        }
        throw Error('Should have failed to set hash');
    });

    it('should clear IPFS hash after set', async () => {
        await setIPFSHash(1, accounts[0], ipfsHashes[0]);
        expect(await getIPFSHash(1, accounts[0])).to.equal(ipfsHashes[0]);

        await ipfsStorage.clearEntry(1);
        expect(await getIPFSHash(1, accounts[0])).to.be.a('null');
    });

    it('should fire event when entry is cleared', async () => {
        await setIPFSHash(1, accounts[0], ipfsHashes[0]);

        await expectEvent(ipfsStorage.clearEntry(1), 'EntryDeleted');
    });

    it('should prevent clearing a non existing entry', async () => {
        await assertRevert(ipfsStorage.clearEntry(1));
    });
});
