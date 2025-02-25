async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const HuobzRewards = await ethers.getContractFactory("HuobzRewards");
    const rewards = await HuobzRewards.deploy();
    console.log("HuobzRewards deployed to:", rewards.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
