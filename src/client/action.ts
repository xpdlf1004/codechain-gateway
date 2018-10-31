type PlatformAccount = string;

interface GetAccountListAction {
    type: "GET_ACCOUNT_LIST";
    payload: {
        accounts: PlatformAccount[];
    };
}

export type Action = GetAccountListAction;
