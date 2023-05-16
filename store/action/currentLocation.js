export const ADD_TO_HISTORY = 'ADD_TO_HISTORY';
export const EMPTY_HISTORY = 'EMPTY_HISTORY';

export const addToHistory = (item) => dispatch => {
    dispatch({
        type: ADD_TO_HISTORY,
        payload: item
    })
}

export const emptyHistory = () => dispatch => {
	dispatch({
		type: EMPTY_HISTORY
	})
}
