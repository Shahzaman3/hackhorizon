import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const Contract = await ethers.getContractFactory("InvoiceValidation");
  const contract = await Contract.deploy();
  await contract.waitForDeployment(); // Ethers v6 compatible

  console.log("Contract deployed to:", await contract.getAddress()); // Ethers v6 compatible
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
