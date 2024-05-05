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
        this.debug = false;
        this.chains = [];
        this.popupCenter = (url_1, title_1, ...args_1) => __awaiter(this, [url_1, title_1, ...args_1], void 0, function* (url, title, w = 400, h = 600) {
            // Fixes dual-screen position                             Most browsers      Firefox
            const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
            const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
            const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
            const left = (width - w) / 2 + dualScreenLeft;
            const top = (height - h) / 2 + dualScreenTop;
            BywiseProvider.data = { message: '' };
            const options = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${Math.floor(w)},height=${Math.floor(h)},top=${Math.floor(top)},left=${Math.floor(left)}`;
            if (this.debug) {
                console.log(`open windown url: "${url}" -> ${options}`);
            }
            const newWindow = window.open(url, title, options);
            if (newWindow) {
                newWindow.focus();
                while (!newWindow.closed) {
                    if (this.debug) {
                        console.log(`wait windown...`);
                    }
                    yield sleep(1000);
                }
            }
            if (this.debug) {
                console.log(`windown done!`, BywiseProvider.data);
            }
            return newWindow;
        });
        this.connect = () => __awaiter(this, void 0, void 0, function* () {
            yield this.web3.network.tryConnection();
            if (!this.isInit) {
                this.isInit = true;
                window.addEventListener("message", (event) => {
                    if (event.origin !== this.dashboard)
                        return;
                    BywiseProvider.data = JSON.parse(event.data);
                }, false);
            }
            yield this.popupCenter(`${this.dashboard}/connect`, 'Connect');
            if (BywiseProvider.data.message !== 'success' || !BywiseProvider.data.address || BywiseProvider.data.chains === undefined) {
                return null;
            }
            this.isConnected = true;
            this.address = BywiseProvider.data.address;
            return {
                address: this.address,
                chains: BywiseProvider.data.chains
            };
        });
        this.send = (tx) => __awaiter(this, void 0, void 0, function* () {
            const encodedData = base_64_1.default.encode(JSON.stringify({
                chain: this.chain,
                to: tx.to,
                amount: tx.amount,
                type: tx.type,
                data: tx.data
            })).replace(/=/g, '');
            yield this.popupCenter(`${this.dashboard}/send_transaction?tx=${encodedData}`, 'Connect');
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
            this.dashboard = 'https://app.bywise.cloud';
            this.walletApi = 'https://wallet-api.bywise.org';
        }
        else if (chain === 'testnet') {
            this.web3 = new web3_1.Web3({
                initialNodes: ['https://testnet-node1.bywise.org']
            });
            this.explorer = 'https://testnet-explorer.bywise.org';
            this.dashboard = 'https://testnet-dashboard.bywise.org';
            this.walletApi = 'https://testnet-api.bywise.org';
        }
        else {
            throw new Error(`not implemented yet`);
        }
    }
}
BywiseProvider.data = { message: '' };
exports.default = BywiseProvider;
