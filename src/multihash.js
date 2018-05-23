import bs58 from 'bs58';

/**
 * @typedef {Object} Multihash
 * @property {string} digest The digest output of hash function in hex with prepended '0x'
 * @property {number} hashFunction The hash function code for the function used
 * @property {number} size The length of digest
 */

/**
 * Partition multihash string into object representing multihash
 *
 * @param {string} multihash A base58 encoded multihash string
 * @returns {Multihash}
 */
export function getBytes32FromMultihash(multihash) {
    const decoded = bs58.decode(multihash);

    return {
        digest: `0x${decoded.slice(2).toString('hex')}`,
        hashFunction: decoded[0],
        size: decoded[1]
    };
}

/**
 * Encode a multihash structure into base58 encoded multihash string
 *
 * @param {Multihash} multihash
 * @returns {(string|null)} base58 encoded multihash string
 */
export function getMultihashFromBytes32(multihash) {
    const { hashFunction, size } = multihash;
    if (size === 0) {
        return null;
    }
    const digest = Buffer.from(multihash.digest.replace('0x', ''), 'hex');
    // prepend hashFunction and digest size
    const multihashBytes = Buffer.alloc(2 + digest.length);
    multihashBytes[0] = hashFunction;
    multihashBytes[1] = size;
    multihashBytes.set(digest, 2);

    return bs58.encode(multihashBytes);
}

/**
 * Parse Solidity response in array to a Multihash object
 *
 * @param {array} response Response array from Solidity
 * @returns {Multihash} multihash object
 */
export function parseContractResponse(response) {
    const [digest, hashFunction, size] = response;
    return {
        digest,
        hashFunction: hashFunction.toNumber(),
        size: size.toNumber()
    };
}

/**
 * Parse Solidity response in array to a base58 encoded multihash string
 *
 * @param {array} response Response array from Solidity
 * @returns {string} base58 encoded multihash string
 */
export function getMultihashFromContractResponse(response) {
    return getMultihashFromBytes32(parseContractResponse(response));
}
