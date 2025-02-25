import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Bitcoin from 'bitcoinjs-lib';

const Wallet = () => {
const [wallet, setWallet] = useState(null);
const [balance, setBalance] = useState(0);

useEffect(() => {
const createWallet = async () => {
const wallet = await Bitcoin.ECPair.makeRandom();
setWallet(wallet);
};
createWallet();
}, []);

const getBalance = async () => {
const balance = await Bitcoin.Blockchain.getBalance(wallet.getAddress());
setBalance(balance);
};

return (
<View>
<Text>Wallet Address: {wallet && wallet.getAddress()}</Text>
<Text>Balance: {balance}</Text>
<Button title="Get Balance" onPress={getBalance} />
</View>
);
};

export default Wallet;
