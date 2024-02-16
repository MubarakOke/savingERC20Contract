import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect, assert } from "chai";
  import { ethers } from "hardhat";
  
  
  describe("SaveERC20 Contract Test", function () {
    async function deploySaveERC20(){
      const ERC20 = await ethers.getContractFactory("ERC20");
      const erc20 = await ERC20.deploy();

      const SaveERC20 = await ethers.getContractFactory("SaveERC20");
      const saveERC20 = await SaveERC20.deploy(erc20.target);


      const [account1, account2] = await ethers.getSigners();
      const amountToDeposit = 100;
      return { erc20, saveERC20, account1, account2, amountToDeposit };
    };

    async function approveERC20(account: any, address: any, amount: any){
      const { erc20 } = await loadFixture(deploySaveERC20);
      const address2Signer= await ethers.getSigner(account.address);
      await erc20.connect(address2Signer).approve(address, amount);
    };
  
  
    describe("Contract", async () => {
        it("can deposit and check savings balnce", async () => {
            const { saveERC20, account1, amountToDeposit} = await loadFixture(deploySaveERC20);
            await approveERC20(account1, saveERC20.target, amountToDeposit) //Approve Contract

            await saveERC20.deposit(amountToDeposit);

            const balance= await saveERC20.checkUserBalance(account1.address)
            expect(balance).to.equal(amountToDeposit);
        });

        it("can check contract balance", async () => {
          const { saveERC20, account1, amountToDeposit} = await loadFixture(deploySaveERC20);
          await approveERC20(account1, saveERC20.target, amountToDeposit) //Approve Contract

          await saveERC20.deposit(amountToDeposit);

          const balance= await saveERC20.checkContractBalance()

          expect(balance).to.equal(amountToDeposit);
        });

        it("can withdraw", async () => {
          const { saveERC20, account1, amountToDeposit} = await loadFixture(deploySaveERC20);
          await approveERC20(account1, saveERC20.target, amountToDeposit) //Approve Contract
          await saveERC20.deposit(amountToDeposit);

          const amountToWithdraw= 50;
          await saveERC20.withdraw(amountToWithdraw);
          const afterWithdrawalBalance= await saveERC20.checkContractBalance();

          const expecedBalance= amountToDeposit - ((0.1*amountToWithdraw)+amountToWithdraw)
          expect(afterWithdrawalBalance).to.equal(expecedBalance);
        });

        it("money can be withdrawn by owner", async () => {
          const { erc20, saveERC20, account1, account2, amountToDeposit} = await loadFixture(deploySaveERC20);
          const erc20Minted= 1000;
          await erc20.transfer(account2.address, erc20Minted);

          
          const balanceof= await erc20.balanceOf(account2.address);
          const balanceof1= await erc20.balanceOf(account1.address);

          await approveERC20(account2, saveERC20.target, amountToDeposit) //Approve Contract
          const address2Signer= await ethers.getSigner(account2.address);
          await saveERC20.connect(address2Signer).deposit(amountToDeposit);
          
          // const balance= await saveERC20.checkContractBalance()
          // console.log(balance)
          // const amountToWithdraw= 50;
          // await saveERC20.ownerWithdraw(amountToWithdraw);
          // const afterWithdrawalBalance= await saveERC20.checkContractBalance();

          // const expecedBalance= amountToDeposit - ((0.1*amountToWithdraw)+amountToWithdraw)
          // expect(afterWithdrawalBalance).to.equal(expecedBalance);
        });
    })     
           
  });

