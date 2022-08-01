// Load dependencies
const { expect } = require('chai');
const fs = require('fs');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { deployments, getNamedAccounts, ethers } = require('hardhat');
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants');
const { zeroPad } = require('ethers/lib/utils');

const toBN = ethers.BigNumber.from;

describe('Market for ERC721s NFT tests', () => {
  let deployer;
  let gnosis, gnosisProxy, gnosisFactory;

  beforeEach(async () => {
    [deployer, ...accounts] = await ethers.getSigners();
    // get chainId
    chainId = await ethers.provider.getNetwork().then((n) => n.chainId);

    const proxyFactotyInstance = await ethers.getContractFactory('GnosisSafeProxyFactory');
    const gnosisProxyInstance = await ethers.getContractFactory('GnosisSafeProxy');
    const gnosisInstance = await ethers.getContractFactory('GnosisSafe');
    gnosisFactory = await proxyFactotyInstance.deploy();
    gnosis = await gnosisInstance.deploy(); 
    
    const callData = gnosis.interface; 
    const cd = callData.encodeFunctionData('setup', [[accounts[0].address, accounts[1].address, accounts[2].address], 3, ZERO_ADDRESS, '0x', ZERO_ADDRESS, ZERO_ADDRESS, 0, ZERO_ADDRESS]);
    const gg = await gnosisFactory.createProxy(gnosis.address, cd);
    const res = await gg.wait();

    console.log(res.events[1]);
    proxyAddr = res.events[1].args.proxy;
    gnosisProxy = gnosisInstance.attach(proxyAddr);

    sign1 = await sign(proxyAddr, accounts[0].address, 0, '0x', 0, 0, 0, 0, 0, accounts[0].address, 0, accounts[0]);
    console.log(sign1);
  });

  it('test ', async () => {
    const lol = await gnosisProxy.getThreshold();
    
    
  });
});

async function sign(proxy, to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, nonce, signer) {
  const typedData = {
    types: {
      SafeTx: [
        { type: "address", name: "to" },
        { type: "uint256", name: "value" },
        { type: "bytes", name: "data" },
        { type: "uint8", name: "operation" },
        { type: "uint256", name: "safeTxGas" },
        { type: "uint256", name: "baseGas" },
        { type: "uint256", name: "gasPrice" },
        { type: "address", name: "gasToken" },
        { type: "address", name: "refundReceiver" },
        { type: "uint256", name: "nonce" },
      ],
    },
    primaryType: 'SafeTx',
    domain: {
      name: "GnosisSafe",
      version: '1',
      chainId: chainId,
      verifyingContract: proxy,
    },
    message: {
      to,
      value,
      data,
      operation,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      nonce
    },
  };
  
  const signature = await signer._signTypedData(
    typedData.domain,
    { SafeTx: typedData.types.SafeTx },
    typedData.message,
  );
  
  return signature;
}