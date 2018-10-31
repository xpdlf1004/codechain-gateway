type PlatformAccount = string;

interface AccountListAction {
    type: "ACCOUNT_LIST";
    payload: {
        accounts: PlatformAccount[];
    };
}

export type Action = AccountListAction;
