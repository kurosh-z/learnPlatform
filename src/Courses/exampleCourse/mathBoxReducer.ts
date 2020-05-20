import { Draft } from 'immer'

export const SET_CANV_VISIBLE = '[canv] set visible'
export const SET_SVG_VISIBLE = '[svg] set visible'
export const HIDE_CANV = '[canv] hide'
export const HIDE_SVG = '[svg] hide'
// export const PLAY = '[mathbox] play'
// export const PAUSE = '[mathbox] pause'
export const TOGGLE_PAUSE = '[mathbox] toggle'

export type MathBoxActions = {
    type:
        | typeof SET_CANV_VISIBLE
        | typeof SET_SVG_VISIBLE
        | typeof HIDE_CANV
        | typeof HIDE_SVG
        | typeof TOGGLE_PAUSE
    playload?: object
}

export type MathBoxState = Readonly<{
    canvVisibility: boolean
    svgVisibility: boolean
    pause: boolean
}>

export const initMathBoxState: MathBoxState = {
    canvVisibility: true,
    svgVisibility: false,
    pause: true,
}

export function mathboxReducer(
    state: Draft<MathBoxState> = initMathBoxState,
    action: MathBoxActions
): MathBoxState {
    switch (action.type) {
        case SET_CANV_VISIBLE: {
            state.canvVisibility = true
            break
        }
        case SET_SVG_VISIBLE: {
            state.svgVisibility = true
            break
        }
        case HIDE_CANV: {
            state.canvVisibility = false
            break
        }
        case HIDE_SVG: {
            state.svgVisibility = false
            break
        }
        case TOGGLE_PAUSE: {
            state.pause = !state.pause
        }

        default:
            return state
    }
}
