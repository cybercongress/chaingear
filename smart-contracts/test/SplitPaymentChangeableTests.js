const BigNumber = require("bignumber.js")
const chai = require("chai")
const utils = require("./utils.js")
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))
chai.should()

const SplitPaymentChangeable = artifacts.require("SplitPaymentChangeable")

contract("SplitPaymentChangeable", (accounts) => {

    let contract

    const OWNER = accounts[0]
    const PAYEE1 = accounts[1]
    const PAYEE2 = accounts[2]
    const PAYEE3 = accounts[3]
    const SHARE1 = 1
    const SHARE2 = 2
    const VALUE = web3.toWei(3, "ether")

    before(async () => {
        contract = await SplitPaymentChangeable.new(
            [PAYEE1, PAYEE2],
            [SHARE1, SHARE2],
            { from: OWNER, value: VALUE }
        )
    })

    it("#1 allow owner to change payee address", async () => {
        await contract.changePayeeAddress(1, PAYEE3, {from: OWNER})

        const newPayee = await contract.payees(1)
        const newPayeeShare = new BigNumber(await contract.shares(PAYEE3))
        const oldPayeeShare = new BigNumber(await contract.shares(PAYEE2))
        
        newPayee.should.be.equal(PAYEE3)
        newPayeeShare.should.bignumber.equal(SHARE2)
        oldPayeeShare.should.bignumber.equal(0)
    })

    it("#2 should distribute value accurately", async () => {
        
        const oldBalance1 = new BigNumber(web3.eth.getBalance(PAYEE1))
        const oldBalance2 = new BigNumber(web3.eth.getBalance(PAYEE3))

        const res1 = await contract.claim({from:PAYEE1})
        const res2 = await contract.claim({from:PAYEE3})

        const newBalance1 = new BigNumber(web3.eth.getBalance(PAYEE1))
        const newBalance2 = new BigNumber(web3.eth.getBalance(PAYEE3))

        newBalance1.sub(oldBalance1).add(utils.weiUsedForGas(res1)).should.bignumber.equal(web3.toWei(1, "ether"))
        newBalance2.sub(oldBalance2).add(utils.weiUsedForGas(res2)).should.bignumber.equal(web3.toWei(2, "ether"))

    })
})