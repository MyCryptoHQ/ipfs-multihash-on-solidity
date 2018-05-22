pragma solidity ^0.4.18;
import "./Owner.sol";

/**
 * @title IPFSStorage
 * @author Forest Fang (@saurfang)
 * @dev Stores IPFS (multihash) hash by address. A multihash entry is in the format
 * of <varint hash function code><varint digest size in bytes><hash function output>
 * See https://github.com/multiformats/multihash
 *
 * Currently IPFS hash is 34 bytes long with first two segments represented as a single byte (uint8)
 * The digest is 32 bytes long and can be stored using bytes32 efficiently.
 */
contract IPFSStorage is Owner {
    struct Multihash {
        bytes32 digest;
        uint8 hashFunction;
        uint8 size;
    }

    mapping (uint256 => Multihash) private entries;


    event EntrySet (
        uint indexed key,
        bytes32 digest,
        uint8 hashFunction,
        uint8 size
    );

    event EntryDeleted (
        uint indexed key
    );



    /**
    * @dev associate a multihash entry with the sender address
    * @param _key the key to use
    * @param _digest hash digest produced by hashing content using hash function
    * @param _hashFunction hashFunction code for the hash function used
    * @param _size length of the digest
    */
    function setEntry(uint _key, bytes32 _digest, uint8 _hashFunction, uint8 _size)
    public
    {
        onlyOwner();
        Multihash memory entry = Multihash(_digest, _hashFunction, _size);
        entries[_key] = entry;
        emit EntrySet(
            _key, 
            _digest, 
            _hashFunction, 
            _size
        );
    }

    /**
    * @dev deassociate any multihash entry with the sender address
    * @param _key the key to use
    */
    function clearEntry(uint _key)
    public
    {
        onlyOwner();
        require(entries[_key].digest != 0);
        delete entries[_key];
        emit EntryDeleted(_key);
    }

    /**
    * @dev retrieve multihash entry associated with an address
    * @param _key the key to get from
    */
    function getEntry(uint _key)
    public
    view
    returns(bytes32 digest, uint8 hashfunction, uint8 size)
    {
        Multihash storage entry = entries[_key];
        return (entry.digest, entry.hashFunction, entry.size);
    }
}