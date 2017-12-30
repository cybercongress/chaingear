const BigNumber = require("bignumber.js")

module.exports.weiUsedForGas = function(result) {
    const tx = web3.eth.getTransaction(result.tx)
    const price = new BigNumber(tx.gasPrice)
    const gasUsed = new BigNumber(result.receipt.gasUsed)
    return price.mul(gasUsed)
}