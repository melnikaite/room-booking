import 'purecss';
import './index.css';
import Alpine from 'alpinejs';
import Web3 from 'web3';

window.onerror = function (event, source, lineno, colno, error) {
    console.error({ source, lineno, colno, error });
    return document.body._x_dataStack[0].error = error?.message || error;
};

window.app = () => {
    return {
        error: null,
        web3: null,
        account: null,
        contractAddress: null,
        contractAbi: [],
        contract: null,
        employee: {},
        slots: [],
        load: async function () {
            if (typeof window.ethereum === 'undefined') {
                return this.error = 'Wallet is not installed';
            }
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            this.account = accounts[0];
            this.web3 = new Web3(window.ethereum);
            this.contractAbi = (await import('../public/abi.json', { assert: { type: 'json' } })).default;
            this.contract = new this.web3.eth.Contract(
                this.contractAbi,
                process.env.CONTRACT_ADDRESS,
                { from: this.account },
            );
            this.employee = await this.contract.methods.getEmployee(
                this.account,
            ).call();
            await this.loadSlots();
        },
        loadSlots: async function () {
            this.slots.splice(0);
            const batch = new this.web3.BatchRequest();
            for (let hour = 8; hour < 21; hour++) {
                for (let companyId = 1; companyId <= 2; companyId++) {
                    for (let roomId = 1; roomId <= 10; roomId++) {
                        batch.add(this.contract.methods.getSlot(
                            companyId,
                            roomId,
                            hour,
                        ).call.request({}, (err, slot) => {
                            this.slots.push({
                                key: `${hour}-${roomId}-${companyId}`,
                                hour,
                                roomId,
                                companyId,
                                owner: slot.owner,
                                isApproved: slot.isApproved,
                            });
                        }));
                    }
                }
            }
            batch.execute();
        },
        canBook: function (slot) {
            return !slot.isApproved;
        },
        book: async function (slot) {
            this.error = null;
            await this.contract.methods.book(
                slot.companyId,
                slot.roomId,
                slot.hour,
            ).send();
            await this.loadSlots();
        },
        canApprove: function (slot) {
            return !slot.isApproved &&
                slot.owner !== '0x0000000000000000000000000000000000000000' &&
                this.employee.isAdministrator &&
                Number(slot.companyId) === Number(this.employee.companyId);
        },
        approve: async function (slot) {
            this.error = null;
            await this.contract.methods.approve(
                slot.roomId,
                slot.hour,
            ).send();
            await this.loadSlots();
        },
        canReject: function (slot) {
            return slot.owner !==
                '0x0000000000000000000000000000000000000000' &&
                this.employee.isAdministrator &&
                Number(slot.companyId) === Number(this.employee.companyId);
        },
        reject: async function (slot) {
            this.error = null;
            await this.contract.methods.reject(
                slot.roomId,
                slot.hour,
            ).send();
            await this.loadSlots();
        },
        canCancel: function (slot) {
            return slot.owner.toLowerCase() === this.account.toLowerCase();
        },
        cancel: async function (slot) {
            this.error = null;
            await this.contract.methods.cancel(
                slot.companyId,
                slot.roomId,
                slot.hour,
            ).send();
            await this.loadSlots();
        },
    };
};

window.Alpine = Alpine;
Alpine.start();
