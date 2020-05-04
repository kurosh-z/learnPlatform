import React, { createContext, useContext } from 'react'
import { useImmerReducer } from 'use-immer'
import { uiReducer, initUiState, UiState, UiActions } from './reducers/ui'

const UiStateContext = createContext<UiState>(initUiState)
const UiDispatchContext = createContext<React.Dispatch<UiActions>>(null)

export const useUiState = () => useContext(UiStateContext)
export const useUiDispatch = () => useContext(UiDispatchContext)

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [uiState, uiDispatch] = useImmerReducer(uiReducer, initUiState)

    return (
        <UiDispatchContext.Provider value={uiDispatch}>
            <UiStateContext.Provider value={uiState}>
                {children}
            </UiStateContext.Provider>
        </UiDispatchContext.Provider>
    )
}
