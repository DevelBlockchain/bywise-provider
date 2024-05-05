<p align="center">
  <img src="assets/bywise.png" width="300" alt="Bywise Web3" />
</p>

# Bywise Web3 Provider

## Contributors Welcome!
Hello, this is a relatively simple library that connects websites with the Bywise blockchain. If you have some basic working JS/TS knowledge, please head over to the open bugs/enhancements and help clear the backlog. Thanks in advance! 🤠

Please don't forget to join our [discord community](https://discord.com/invite/x4TKNBQ9Gz).

---

## Installation
```sh
npm install @bywise/provider
```

I also recommend installing @bywise/web3.

```sh
npm install @bywise/web3
```

## Usage

Require in `javascript` as
```javascript
const BywiseProvider = require('@bywise/provider');
```
For `typescript`, use
```javascript
import BywiseProvider from '@bywise/provider';
```

## Operations

### New instance

```javascript
const chain = 'mainnet' // select your chain (default: mainnet)
const provider = new BywiseProvider(chain);
```

### Connect provider

```javascript
const userInfo = await provider.connect();

if (userInfo) { 
  const userAddress = provider.address;
  const connectedChain = provider.chains;

  // Provider connected successfully
} else {
  // User canceled the connection
}
```

### Get User Blockchain Information

```javascript

const infoBlockchainUser = await provider.web3.wallets.getWalletInfo(provider.address, chain);

console.log('infoBlockchainUser', infoBlockchainUser)
if (infoBlockchainUser) {
  const balance = infoBlockchainUser.balance // BWS Balance
  const name = infoBlockchainUser.name // can be null
  const url = infoBlockchainUser.url // can be null
  const bio = infoBlockchainUser.bio // can be null
  const photo = infoBlockchainUser.photo // can be null
} else {
  // Failed get info
}
```

### Make simple transaction

```javascript
import { TxType } from '@bywise/web3';

const sendAddress = 'BWS000000000000000000000000000000000000000000000';
const sendBWSAmount = '0';

const result = await provider.send({
  to: [sendAddress],
  amount: [sendBWSAmount],
  type: TxType.TX_NONE,
  data: {}
});
if (result) {
  const tx = result.tx; // full transaction
  const fullOutput = result.output; // full result output
  
  const contractReturn = fullOutput.output;
  console.log('contractReturn', contractReturn)
} else {
  // canceled transaction
}
```

### Read contract

```javascript
const contractAddress = 'BWS000000000000000000000000000000000000000000000';
const contractMethodName = 'someMethod';
const parameters = []; // string list

const fullOutput = await provider.web3.contracts.readContract(chain, contractAddress, contractMethodName, parameters);
if(fullOutput.error) {
    console.log('error', fullOutput.error)
} else {
    const contractReturnValue = fullOutput.output;
    console.log('contractReturnValue', contractReturnValue)
}
```

### Write contract

```javascript
import { TxType } from '@bywise/web3';

const contractAddress = 'BWS000000000000000000000000000000000000000000000';
const sendBWSToContract = '0';

const result = await provider.send({
  to: [contractAddress],
  amount: [sendBWSToContract],
  type: TxType.TX_CONTRACT_EXE,
  data: [
    {
      method: 'someMethod',
      inputs: ['arg1' , 'ar2'],
    },
  ]
});
if (result) {
  const tx = result.tx; // full transaction
  const fullOutput = result.output; // full result output

  const contractReturn = fullOutput.output;
  console.log('contractReturn', contractReturn)
} else {
  // canceled transaction
}
```