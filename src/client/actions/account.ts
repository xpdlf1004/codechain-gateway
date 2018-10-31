import { Dispatch } from "redux";

const GET_ACCOUNT_LIST = "GET_ACCOUNT_LIST";
export const getAccountList = (dispatch: Dispatch) => {
    return () => {
        fetch("//localhost:4000/account/list")
            .then(response => {
                return response.json();
            })
            .then(json => {
                dispatch({
                    type: GET_ACCOUNT_LIST,
                    payload: {
                        accounts: json
                    }
                });
            })
            .catch(err => {
                dispatch({
                    type: "API_ERROR",
                    payload: {
                        type: GET_ACCOUNT_LIST,
                        err
                    }
                });
            });
    };
};
