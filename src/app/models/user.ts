export interface User{
    email: string;
    token: string;
    tradingAccounts: TradingAccount[];
}

export interface TradingAccount{
    tradingAccountId: string;
    tradingApiToken: string;
    tradingAccountToken: {
        token: string,
        expiration: string
    }
    balance: Balance;
    offer: {
        name: string;
        system: {
            uuid: string
        }
    }
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
    currencyPrecision: number
}