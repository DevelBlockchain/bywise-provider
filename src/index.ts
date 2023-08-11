import { Tx, TxOutput, TxType, Web3 } from "@bywise/web3";
import base64 from 'base-64';

const sleep = async function sleep(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms + 10);
    });
}

type Chain = {
    chain: string,
    market: string,
    nodesAmount: number,
    name: string,
    status: string,
    explorer: string,
    nodes: string[]
}

export default class BywiseProvider {
    public readonly web3: Web3;
    private readonly explorer: string;
    private readonly dashboard: string;
    private readonly walletApi: string;
    public readonly chain: string;
    private static data: { message: string, tx?: Tx, output?: TxOutput, address?: string, chains?: Chain[] } = { message: '' };
    public isConnected: boolean = false;
    public address: string = '';
    private isInit: boolean = false;
    private readonly debug: boolean = false;
    private chains: Chain[] = [];

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

    private popupCenter = async (url: string, title: string, w: number = 400, h: number = 600) => {
        // Fixes dual-screen position                             Most browsers      Firefox
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        const left = (width - w) / 2 + dualScreenLeft
        const top = (height - h) / 2 + dualScreenTop
        BywiseProvider.data = { message: '' };
        const options = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${Math.floor(w)},height=${Math.floor(h)},top=${Math.floor(top)},left=${Math.floor(left)}`;
        if (this.debug) {
            console.log(`open windown url: "${url}" -> ${options}`)
        }
        const newWindow = window.open(url, title, options)
        if (newWindow) {
            newWindow.focus();
            while (!newWindow.closed) {
                if (this.debug) {
                    console.log(`wait windown...`)
                }
                await sleep(1000);
            }
        }
        if (this.debug) {
            console.log(`windown done!`, BywiseProvider.data)
        }
        return newWindow
    }

    connect = async (): Promise<{ address: string, chains: Chain[] } | null> => {
        await this.web3.network.tryConnection();

        if (!this.isInit) {
            this.isInit = true;
            window.addEventListener("message", (event) => {
                if (event.origin !== this.dashboard) return;
                BywiseProvider.data = JSON.parse(event.data);
            }, false);
        }

        await this.popupCenter(`${this.dashboard}/connect`, 'Connect');

        if (BywiseProvider.data.message !== 'success' || !BywiseProvider.data.address || BywiseProvider.data.chains === undefined) {
            return null;
        }
        this.isConnected = true;
        this.address = BywiseProvider.data.address
        return {
            address: this.address,
            chains: BywiseProvider.data.chains
        };
    }

    send = async (tx: {
        to: string[],
        amount: string[],
        type: TxType,
        data: any,
    }): Promise<{ tx: Tx, output: TxOutput } | null> => {
        const encodedData = base64.encode(JSON.stringify({
            chain: this.chain,
            to: tx.to,
            amount: tx.amount,
            type: tx.type,
            data: tx.data
        })).replace(/=/g, '');

        await this.popupCenter(`${this.dashboard}/send_transaction?tx=${encodedData}`, 'Connect');

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