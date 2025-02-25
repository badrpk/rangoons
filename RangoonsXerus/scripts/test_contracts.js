const { ethers } = require("ethers");

// Set up provider and signer
const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID"); // Replace with your Infura project ID
const signer = provider.getSigner();
const rewardsContractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address

const contractABI = [
    "function rewardUser(address user, uint256 amount) public",
    "function claimReward() public"
];

const rewardsContract = new ethers.Contract(rewardsContractAddress, contractABI, signer);

// Reward User Function
async function rewardUser(userAddress, amount) {
    const tx = await rewardsContract.rewardUser(userAddress, amount);
    await tx.wait();
    console.log(`Rewarded ${amount} HuobzCoins to ${userAddress}`);
}

// Example usage: reward a user with 50 HuobzCoins
rewardUser("USER_WALLET_ADDRESS", 50);
