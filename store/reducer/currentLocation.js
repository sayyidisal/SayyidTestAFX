import { ADD_TO_HISTORY, EMPTY_HISTORY } from "../action/currentLocation"

const initialState = {
    historyLocation: [],
    total: 0,
}

export default function(state=initialState, action) {
    switch(action.type){
        case ADD_TO_HISTORY:
            return {
                ...state,
                historyLocation: [action.payload, ...state.historyLocation],
                total: state.total + action.payload.cost
            }
        case EMPTY_HISTORY:
            return {
                ...state,
                history: [],
                total: 0
            }
        default:
            return state
    }
}