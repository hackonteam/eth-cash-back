import { ethers, run, network } from "hardhat";

async function main() {
    console.log("🚀 Deploying CashbackManager to", network.name);

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deployer address:", deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Deploy CashbackManager
    const CashbackManager = await ethers.getContractFactory("CashbackManager");
    const cashbackManager = await CashbackManager.deploy();
    await cashbackManager.waitForDeployment();

    const contractAddress = await cashbackManager.getAddress();
    console.log("✅ CashbackManager deployed to:", contractAddress);
    console.log("👤 Admin address:", await cashbackManager.admin());

    // Verify on Etherscan (if not localhost)
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("⏳ Waiting for block confirmations...");
        // Wait for 5 block confirmations
        await cashbackManager.deploymentTransaction()?.wait(5);

        console.log("🔍 Verifying contract on Etherscan...");
        try {
            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });
            console.log("✅ Contract verified successfully");
        } catch (error: any) {
            if (error.message.includes("Already Verified")) {
                console.log("ℹ️ Contract already verified");
            } else {
                console.error("❌ Verification failed:", error.message);
            }
        }
    }

    // Log deployment summary
    console.log("\n📋 Deployment Summary:");
    console.log("========================");
    console.log("Network:", network.name);
    console.log("Chain ID:", network.config.chainId);
    console.log("Contract Address:", contractAddress);
    console.log("Admin:", await cashbackManager.admin());
    console.log("========================\n");

    return contractAddress;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
