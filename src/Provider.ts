import { Tx, TxOutput, TxType, Web3 } from "@bywise/web3";
import base64 from 'base-64';

const sleep = async function sleep(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
}

export class BywiseProvider {
    public readonly web3: Web3;
    private readonly explorer: string;
    private readonly dashboard: string;
    private readonly walletApi: string;
    private readonly chain: string;
    private static data: { message: string, tx?: Tx, output?: TxOutput, address?: string } = { message: '' };
    public isConnected: boolean = false;
    public address: string = '';
    private isInit: boolean = false;

    constructor(chain: string = 'mainnet') {
        this.chain = chain;
        if (chain === 'mainnet') {
            this.web3 = new Web3({
                initialNodes: ['https://node1.bywise.org']
            });
            this.explorer = 'https://explorer.bywise.org'
            this.dashboard = 'https://dashboard.bywise.org'
            this.walletApi = 'https://wallet-api.bywise.org'
        } else if (chain === 'testnet') {
            this.web3 = new Web3({
                initialNodes: ['https://testnet-node1.bywise.org']
            });
            this.explorer = 'https://testnet-explorer.bywise.org'
            this.dashboard = 'https://testnet-dashboard.bywise.org'
            this.walletApi = 'https://testnet-api.bywise.org'
        } else {
            throw new Error(`not implemented yet`);
        }
    }

    private popupCenter = (url: string, title: string, w: number = 400, h: number = 600) => {
        // Fixes dual-screen position                             Most browsers      Firefox
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const systemZoom = width / window.screen.availWidth;
        const left = (width - w) / 2 / systemZoom + dualScreenLeft
        const top = (height - h) / 2 / systemZoom + dualScreenTop
        const newWindow = window.open(url, title, `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${w / systemZoom},height=${h / systemZoom},top=${top},left=${left}`)
        if (newWindow) newWindow.focus();
    }

    connect = async (): Promise<boolean> => {
        await this.web3.network.tryConnection();

        if (!this.isInit) {
            this.isInit = true;
            window.addEventListener("message", (event) => {
                if (event.origin !== this.dashboard) return;
                BywiseProvider.data = JSON.parse(event.data);
            }, false);
        }

        BywiseProvider.data.message = '';
        this.popupCenter(`${this.dashboard}/connect`, 'Connect');

        while (BywiseProvider.data.message === '') {
            await sleep(1000);
        }
        if (BywiseProvider.data.message !== 'success' || !BywiseProvider.data.address) {
            return false;
        }
        this.isConnected = true;
        this.address = BywiseProvider.data.address
        return true;
    }

    send = async (to: string[], amount: string[], type: TxType = TxType.TX_NONE, data: any = {}): Promise<{ tx: Tx, output: TxOutput } | null> => {
        if (!this.isInit) throw new Error(`Not connected`);

        const encodedData = base64.encode(JSON.stringify({
            to, amount, type, data
        })).replace(/=/g, '');

        BywiseProvider.data.message = '';
        this.popupCenter(`${this.dashboard}/send_transaction?tx=${encodedData}`, 'Connect');

        while (BywiseProvider.data.message === '') {
            await sleep(1000);
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
        }
    }
}