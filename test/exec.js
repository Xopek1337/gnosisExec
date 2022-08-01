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
  });

  it('should deposit and withdraw 1 ETH', async () => {
    const lol = await gnosisProxy.getThreshold();
    
    console.log(lol);
  });
});

async function signRent(_token, _payToken, tokenId, rentTime, price, nonce, deadline, signer) {
  const typedData = {
    types: {
      Rent: [
        { name: '_token', type: 'address' },
        { name: '_payToken', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'rentTime', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Rent',
    domain: {
      name: "NFTMarketplaceV2",
      version: '1',
      chainId: chainId,
      verifyingContract: Market.address,
    },
    message: {
      _token,
      _payToken,
      tokenId,
      rentTime,
      price,
      nonce,
      deadline,
    },
  };
  
  const signature = await signer._signTypedData(
    typedData.domain,
    { Rent: typedData.types.Rent },
    typedData.message,
  );
  
  return signature;
}

async function signPermit(signer, spender, nonce, deadline, holder) {
  const typedData = {
    types: {
      PermitAll: [
        { name: 'signer', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'PermitAll',
    domain: {
      name: "MockNFT",
      version: '1',
      chainId: chainId,
      verifyingContract: LockNFT.address,
    },
    message: {
      signer,
      spender,
      nonce,
      deadline,
    },
  };
  
  const signature = await holder._signTypedData(
    typedData.domain,
    { PermitAll: typedData.types.PermitAll },
    typedData.message,
  );
  
  return signature;
}