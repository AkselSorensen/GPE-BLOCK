const hre = require("hardhat");

async function main() {
  // Déployer le contrat
  const GameFiGovernance = await hre.ethers.getContractFactory("GameFiGovernance");
  const contract = await GameFiGovernance.deploy(10000); // Initial reward pool : 10,000 tokens

  await contract.deployed();
  console.log("GameFiGovernance déployé à l'adresse :", contract.address);
}

// Exécuter le script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});