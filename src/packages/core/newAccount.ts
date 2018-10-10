const RIPEMD160 = require('ripemd160');
const secp256k1 = require('secp256k1');
const shajs = require('sha.js');
const bs58 = require('bs58');
const { randomBytes } = require('crypto');

class NewAccount
{
	public chainId: number;
	public addressType: number;

	// private _debug: boolean = false;
	// private startTime: number;

	private address?: string;
	private privateKey?: string;
	private publicKey?: string;
	private privateKeyBuffer?: Buffer;
	private publicKeyBuffer?: Buffer;

	constructor(privateKey: string, addressType: number = 1)
	{
		this.chainId = 8964; // https://github.com/nuls-io/nuls/blob/d8227554ce35dfd7557ed489fb5949b528a738bf/core-module/kernel/src/main/java/io/nuls/kernel/context/NulsContext.java#L70
		this.addressType = addressType; // https://github.com/nuls-io/nuls/blob/d8227554ce35dfd7557ed489fb5949b528a738bf/core-module/kernel/src/main/java/io/nuls/kernel/context/NulsContext.java#L76
		this.privateKey = privateKey;
		// this.startTime = Date.now();
		this.createAccount();
	}

	/**
	 * Old debug function to be used if needed
	 */
	// logTime()
	// {
	// 	return Date.now() - this.startTime;
	// }

	getAccount()
	{
		return {
			address: this.address,
			privateKey: this.privateKey,
			publicKey: this.publicKey
		};
	}

	createAccount()
	{
		if(this.privateKey) // If a private key already exists we use it
		{
			this.privateKeyBuffer = this.stringToHex(this.privateKey); // Turn it into a buffer for reading
		}
		else
		{
			// Create a random private key
			do
			{
				this.privateKeyBuffer = randomBytes(32); // Generates the ECKey
			} while(!secp256k1.privateKeyVerify(this.privateKeyBuffer));
		}

		try
		{
			this.publicKeyBuffer = secp256k1.publicKeyCreate(this.privateKeyBuffer);
		}
		catch(e)
		{
			if(this.privateKey)
			{
				throw new Error('Invalid private key provided.');
			}
			else
			{
				throw new Error('Invalid private key generated.');
			}
		}

		this.privateKey = this.hexToString(this.privateKeyBuffer);
		this.publicKey = this.hexToString(this.publicKeyBuffer);
		this.address = this.createAddress();

		this.validatePrivateKey();
	}

	/**
	 * Validate the private keys
	 */
	validatePrivateKey()
	{
		const msg = randomBytes(32);
		const sigObj = secp256k1.sign(msg, this.privateKeyBuffer);

		if(!secp256k1.verify(msg, sigObj.signature, this.publicKeyBuffer))
		{
			throw new Error('Something went wrong when validating the signature.');
		}
	}

	privateKeyHash()
	{
		// sha256hash160
		// https://github.com/nuls-io/nuls/blob/274204b748ed72fdac150637ee758037d64c7ce5/core-module/kernel/src/main/java/io/nuls/kernel/utils/AddressTool.java#L61
		const sha = new shajs.sha256().update(this.publicKeyBuffer).digest();
		const hash = new RIPEMD160().update(sha).digest();

		return hash;
	}

	getPublicKeyHash()
	{
		const output = Buffer.allocUnsafe(3);

		output.writeInt16LE(this.chainId, 0);
		output.writeInt8(this.addressType, 2);

		return Buffer.concat([output, this.privateKeyHash()]);
	}

	createAddress()
	{
		const publicKeyHash = this.getPublicKeyHash();

		// https://github.com/nuls-io/nuls/blob/274204b748ed72fdac150637ee758037d64c7ce5/core-module/kernel/src/main/java/io/nuls/kernel/utils/AddressTool.java#L182
		const address = bs58.encode(
			Buffer.concat([
				publicKeyHash,
				Buffer.from([
					publicKeyHash.reduce((xor, value) => xor ^ value)
				])
			])
		);

		return address;
	}

	stringToHex(string?: string)
	{
		if(!string) return undefined;

		return Buffer.from(string, 'hex');
	}

	hexToString(hex?: Buffer)
	{
		if(!hex) return undefined;

		return hex.toString('hex');
	}

	// set debug(value: boolean)
	// {
	// 	this._debug = value;
	// 	this.createAccount();
	// }
	//
	// get debug()
	// {
	// 	return this._debug;
	// }
}

module.exports = NewAccount;
