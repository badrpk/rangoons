require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
    solidity: "0.8.0",
    networks: {
        mumbai: {
            url: `https://rpc-mumbai.maticvigil.com`,
            accounts: [`0x${process.env.PRIVATE_KEY}`], // Add your private key here
        },
    },
};
