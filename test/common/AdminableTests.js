const chai = require("chai")
chai.should()
chai.use(require("chai-bignumber")())
chai.use(require("chai-as-promised"))

const AdminableTestContract = artifacts.require('AdminableTestContract');

contract('AdminableTestContract', function (accounts) {

    let adminableTestContract;
    const ADMIN_ACCOUNT = accounts[0]
    const OWNER_ACCOUNT = accounts[0]
    const UNKNOWN_ACCOUNT = accounts[1]

    before(async () => {
        adminableTestContract = await AdminableTestContract.new({from: ADMIN_ACCOUNT})
    });


    it('#1 should have an admin', async () => {
        await adminableTestContract.admin_().should.eventually.equal(ADMIN_ACCOUNT)
    });

    it('#2/1 should allow owner to change admin', async () => {
        const newAdmin = accounts[2]
        await adminableTestContract.admin_().should.eventually.not.equal(newAdmin)
        await adminableTestContract.changeAdmin(newAdmin, {from: OWNER_ACCOUNT}).should.be.fulfilled
        await adminableTestContract.admin_().should.eventually.equal(newAdmin)
    });

    it('#2/2 should not allow admin to change admin', async () => {
        const newAdmin = accounts[3]
        const currentAdmin = await adminableTestContract.admin_()
        await adminableTestContract.admin_().should.eventually.not.equal(newAdmin)
        await adminableTestContract.changeAdmin(newAdmin, {from: currentAdmin}).should.be.rejected
        await adminableTestContract.admin_().should.eventually.equal(currentAdmin)
    });

    it('#2/3 should not allow unknown account to change admin', async () => {
        const newAdmin = accounts[4]
        const currentAdmin = await adminableTestContract.admin_()
        await adminableTestContract.admin_().should.eventually.not.equal(newAdmin)
        await adminableTestContract.changeAdmin(newAdmin, {from: UNKNOWN_ACCOUNT}).should.be.rejected
        await adminableTestContract.admin_().should.eventually.equal(currentAdmin)
    });

    it('#2/4 should not allow owner to change admin while paused', async () => {
        const contract = await AdminableTestContract.new({from: ADMIN_ACCOUNT})
        const newAdmin = accounts[2]
        const currentAdmin = await contract.admin_()

        await contract.pause().should.be.fulfilled
        await contract.changeAdmin(newAdmin, {from: OWNER_ACCOUNT}).should.be.rejected
        await contract.admin_().should.eventually.equal(currentAdmin)
    });

    it("#3/1 should allow admin to invoke methods with modifier 'onlyAdmin'", async () => {
        const admin = await adminableTestContract.admin_()
        const value = await adminableTestContract.uintValue_()
        await adminableTestContract.testOnlyAdminModifier(value + 1, {from: admin}).should.be.fulfilled
        await adminableTestContract.uintValue_().should.eventually.bignumber.equal(value + 1)
    });

    it("#3/2 should not allow owner to invoke methods with modifier 'onlyAdmin'", async () => {
        const owner = await adminableTestContract.owner()
        const value = await adminableTestContract.uintValue_()
        await adminableTestContract.testOnlyAdminModifier(value + 1, {from: owner}).should.be.rejected
        await adminableTestContract.uintValue_().should.eventually.bignumber.equal(value)
    });
});
