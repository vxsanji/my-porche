export interface User{
    token: string;
    username: string;
}

export interface TradingAccount{
    id:string;
    name:string;
    tradingAccounts: [
        {
            tradingAccountId: string,
            name: string,
            isActive: boolean
        }
    ]
}

export interface Balance {
    balance: string,
    equity: string,
    freeMargin: string,
    marginLevel: string,
    credit: string,
    currency: string,
    margin: string,
    profit: string,
    netProfit: string,
    currencyPrecision: number,
    title: string,
    volume: number
}