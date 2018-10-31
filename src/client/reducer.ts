import { Action } from "./action";

const initialState = {};

export const rootReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case "ACCOUNT_LIST":
            break;
        default:
            break;
    }
    return state;
};
