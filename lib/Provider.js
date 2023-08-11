"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BywiseProvider = void 0;
const web3_1 = require("@bywise/web3");
const base_64_1 = __importDefault(require("base-64"));
const sleep = function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve) => {
            setTimeout(resolve, ms + 10);
        });
    });
};
class BywiseProvider {
    constructor(chain = 'mainnet') {
        this.isConnected = false;
        this.address = '';
        this.isInit = false;
        this.popupCenter = (url, title, w = 400, h = 600) => {
            // Fixes dual-screen position                             Most browsers      Firefox
            const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
            const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
            const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
            const systemZoom = width / window.screen.availWidth;
            const left = (width - w) / 2 / systemZoom + dualScreenLeft;
            const top = (height - h) / 2 / systemZoom + dualScreenTop;
            const newWindow = window.open(url, title, `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${w / systemZoom},height=${h / systemZoom},top=${top},left=${left}`);
            if (newWindow)
                newWindow.focus();
        };
        this.connect = () => __awaiter(this, void 0, void 0, function* () {
            yield this.web3.network.tryConnection();
            if (!this.isInit) {
                this.isInit = true;
                window.addEventListener("message", (event) => {
                    if (event.origin !== this.walletApi)
                        return;
                    BywiseProvider.data = JSON.parse(event.data);
                }, false);
            }
            BywiseProvider.data.message = '';
            this.popupCenter(`${this.walletApi}/connect`, 'Connect');
            while (BywiseProvider.data.message === '') {
                yield sleep(1000);
            }
            if (BywiseProvider.data.message !== 'success' || !BywiseProvider.data.address) {
                return false;
            }
            this.isConnected = true;
            this.address = BywiseProvider.data.address;
            return true;
        });
        this.send = (to, amount, type = web3_1.TxType.TX_NONE, data = {}) => __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit)
                throw new Error(`Not connected`);
            const encodedData = base_64_1.default.encode(JSON.stringify({
                to, amount, type, data
            })).replace(/=/g, '');
            BywiseProvider.data.message = '';
            this.popupCenter(`${this.walletApi}/send_transaction?tx=${encodedData}`, 'Connect');
            while (BywiseProvider.data.message === '') {
                yield sleep(1000);
            }
            if (BywiseProvider.data.message !== 'success') {
                return null;
            }
            if (!BywiseProvider.data.tx || !BywiseProvider.data.output) {
                throw new Error(`Failed`);
            }
            return {
                tx: BywiseProvider.data.tx,
                output: BywiseProvider.data.output,
            };
        });
        this.chain = chain;
        if (chain === 'mainnet') {
            this.web3 = new web3_1.Web3({
                initialNodes: ['https://node1.bywise.org']
            });
            this.explorer = 'https://explorer.bywise.org';
            this.walletApi = 'https://wallet-api.bywise.org';
        }
        else if (chain === 'testnet') {
            this.web3 = new web3_1.Web3({
                initialNodes: ['https://testnet-node1.bywise.org']
            });
            this.explorer = 'https://testnet-explorer.bywise.org';
            this.walletApi = 'https://testnet-api.bywise.org';
        }
        else {
            throw new Error(`not implemented yet`);
        }
    }
}
exports.BywiseProvider = BywiseProvider;
BywiseProvider.data = { message: '' };
