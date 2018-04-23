import { expect, assert } from 'chai';

import {
    getBytes32FromMultiash,
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

    async function setIPFSHash(account, hash) {
        const { digest, hashFunction, size } = getBytes32FromMultiash(hash);
        return ipfsStorage.setEntry(digest, hashFunction, size, {
            from: account
        });
    }

    async function getIPFSHash(account) {
        return getMultihashFromContractResponse(
            await ipfsStorage.getEntry(account)
        );
    }

    it('should get IPFS hash after setting', async () => {
        await setIPFSHash(accounts[0], ipfsHashes[0]);

        expect(await getIPFSHash(accounts[0])).to.equal(ipfsHashes[0]);
    });

    it('should fire event when new has is set', async () => {
        await expectEvent(setIPFSHash(accounts[0], ipfsHashes[0]), 'EntrySet');
    });

    it('should fail to set a hash for a non owner', async () => {
        try {
            await setIPFSHash(accounts[1], ipfsHashes[1]);
        } catch (e) {
            return assert.exists(e);
        }
        throw Error('Should have failed to set hash');
    });

    it('should clear IPFS hash after set', async () => {
        await setIPFSHash(accounts[0], ipfsHashes[0]);
        expect(await getIPFSHash(accounts[0])).to.equal(ipfsHashes[0]);

        await ipfsStorage.clearEntry();
        expect(await getIPFSHash(accounts[0])).to.be.a('null');
    });

    it('should fire event when entry is cleared', async () => {
        await setIPFSHash(accounts[0], ipfsHashes[0]);

        await expectEvent(ipfsStorage.clearEntry(), 'EntryDeleted');
    });

    it('should prevent clearing non-exists entry', async () => {
        await assertRevert(ipfsStorage.clearEntry());
    });
});
