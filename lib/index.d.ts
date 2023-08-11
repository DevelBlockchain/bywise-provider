import { Tx, TxOutput, TxType, Web3 } from "@bywise/web3";
type Chain = {
    chain: string;
    market: string;
    nodesAmount: number;
    name: string;
    status: string;
    explorer: string;
    nodes: string[];
};
export default class BywiseProvider {
    readonly web3: Web3;
    private readonly explorer;
    private readonly dashboard;
    private readonly walletApi;
    readonly chain: string;
    private static data;
    isConnected: boolean;
    address: string;
    private isInit;
    private readonly debug;
    private chains;
    constructor(chain?: string);
    private popupCenter;
    connect: () => Promise<{
        address: string;
        chains: Chain[];
    } | null>;
    send: (tx: {
        to: string[];
        amount: string[];
        type: TxType;
        data: any;
    }) => Promise<{
        tx: Tx;
        output: TxOutput;
    } | null>;
}
export {};
