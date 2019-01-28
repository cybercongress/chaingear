const chai = require("chai");
const bnChai = require("bn-chai");
const expect = chai.expect;

chai.use(bnChai(web3.utils.BN));
chai.use(require('chai-as-promised'));
chai.should();

const {toWei, toBN, fromWei, BN} = web3.utils;

const FeeSplitterDatabase = artifacts.require("FeeSplitterDatabase");

contract("FeeSplitterDatabase", (accounts) => {
    
    let splitter;
    
    const OWNER = accounts[0];
    const ADMIN = accounts[9];
    const UNKNOWN = accounts[8];
    const BENEFICIARY_1 = accounts[1];
    const BENEFICIARY_2 = accounts[2];
    const BENEFICIARY_3 = accounts[3];
    const BENEFICIARY_4 = accounts[4];
    const BENEFICIARY_4_CHANGED = accounts[5];
    const BENEFICIARY_1_SHARES = toBN('125');
    const BENEFICIARY_2_SHARES = toBN('125');
    const BENEFICIARY_3_SHARES = toBN('250');
    const BENEFICIARY_4_SHARES = toBN('500');
    const BENEFICIARIES = [BENEFICIARY_1, BENEFICIARY_2, BENEFICIARY_3, BENEFICIARY_4];
    const BENEFICIARIES_SHARES = [BENEFICIARY_1_SHARES, BENEFICIARY_2_SHARES, BENEFICIARY_3_SHARES, BENEFICIARY_4_SHARES];
    
    before(async () => {
        splitter = await FeeSplitterDatabase.new(
            BENEFICIARIES,
            BENEFICIARIES_SHARES,
            { from: OWNER }
        );
        await splitter.transferAdminRights(ADMIN, { from: OWNER });
        await splitter.unpause({ from: ADMIN });
    })
    
    describe("when initialized", () => {
        it("should accept payments", async () => {
            let payment = toWei('1', 'ether');
            await splitter.sendTransaction({ value: payment, from: UNKNOWN });
            expect(await web3.eth.getBalance(splitter.address)).to.eq.BN(payment)
        });
        
        it("should have payees", async () => {
            for (var i = 0; i < BENEFICIARIES.length; i++) {
                (await splitter.getPayee(i)).should.be.equal(BENEFICIARIES[i]);
            }
        });
        
        it("payess should have shares", async () => {
            for (var i = 0; i < BENEFICIARIES.length; i++) {
                expect(await splitter.getShares(BENEFICIARIES[i])).to.eq.BN(BENEFICIARIES_SHARES[i]);
            }
        });
        
        it("should have correct total shares", async () => {
            expect(await splitter.getTotalShares()).to.eq.BN(toBN('1000'));
        })
        
        it("should have correct total released", async () => {
            expect(await splitter.getTotalReleased()).to.eq.BN(toBN('0'));
        })
        
        it("should have correct payess count", async () => {
            expect(await splitter.getPayeesCount()).to.eq.BN(toBN('4'));
        })
    })
    
    describe("when releasing", () => {
        it("should release correct amount", async () => {
            let balanceBefore = new BN(await web3.eth.getBalance(BENEFICIARY_4));
            await splitter.release(BENEFICIARY_4, { from: UNKNOWN }).should.be.fulfilled;
            let balanceAfter = new BN(await web3.eth.getBalance(BENEFICIARY_4));
            expect(balanceAfter.sub(balanceBefore)).to.eq.BN(toWei(new BN('500'), 'finney'));
        })
    })
    
    describe("when changing payee address", () => {
        it("should change payee address", async () => {
            (await splitter.getPayee(3)).should.be.equal(BENEFICIARY_4);
            await splitter.changePayeeAddress(3, BENEFICIARY_4_CHANGED, { from: BENEFICIARY_4 }).should.be.fulfilled;
            (await splitter.getPayee(3)).should.be.equal(BENEFICIARY_4_CHANGED);
        })
        
        it("should allow release correct amount to changed address", async () => {
            let payment = toWei('1', 'ether');
            await splitter.sendTransaction({ value: payment, from: UNKNOWN });
            
            let balanceBefore = new BN(await web3.eth.getBalance(BENEFICIARY_4_CHANGED));
            await splitter.release(BENEFICIARY_4_CHANGED, { from: UNKNOWN }).should.be.fulfilled;
            let balanceAfter = new BN(await web3.eth.getBalance(BENEFICIARY_4_CHANGED));
            expect(balanceAfter.sub(balanceBefore)).to.eq.BN(toWei(new BN('500'), 'finney'));
        })
    })
    
    describe("when transfering token and adminship", () => {
        it("should correctly delete payess", async () => {
            await splitter.pause({ from: ADMIN }).should.be.fulfilled;
            await splitter.deletePayees({ from: OWNER }).should.be.fulfilled;
            expect(await splitter.getTotalShares()).to.eq.BN(toBN('0'));
            expect(await splitter.getTotalReleased()).to.eq.BN(toBN('0'));
            expect(await splitter.getPayeesCount()).to.eq.BN(toBN('0'));
        })
        
        it("should allow init new set of payees", async () => {
            let BENEFICIARIES_NEW = BENEFICIARIES.reverse();
            await splitter.setPayess(
                BENEFICIARIES_NEW,
                BENEFICIARIES_SHARES,
                { from: ADMIN }
            ).should.be.fulfilled;
            expect(await splitter.getTotalShares()).to.eq.BN(toBN('1000'));
            expect(await splitter.getTotalReleased()).to.eq.BN(toBN('0'));
            expect(await splitter.getPayeesCount()).to.eq.BN(toBN('4'));
            for (var i = 0; i < BENEFICIARIES_NEW.length; i++) {
                (await splitter.getPayee(i)).should.be.equal(BENEFICIARIES_NEW[i]);
            }
            for (var i = 0; i < BENEFICIARIES_NEW.length; i++) {
                expect(await splitter.getShares(BENEFICIARIES_NEW[i])).to.eq.BN(BENEFICIARIES_SHARES[i]);
            }
        })
    })
})