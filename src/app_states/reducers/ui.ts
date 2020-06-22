import { Draft } from 'immer'

export const TOGGLE_NAV_PANEL = '[ui] toggle nav'
export const NAV_ANIM_FININISHED = '[ui] nav anim finished'
export const NAV_ANIM_PROGRESS = '[ui] nav anim progress'
export const IS_MOBILE = '[gen] isMobile'
export const IS_COURSE_PAGE = '[ui] in a coursepage'

export type UiActions =
    | {
          type: typeof TOGGLE_NAV_PANEL
          payload?: null
      }
    | {
          type: typeof NAV_ANIM_FININISHED
          payload?: null
      }
    | {
          type: typeof NAV_ANIM_PROGRESS
          payload?: null
      }
    | {
          type: typeof IS_MOBILE
          payload?: null
      }
    | {
          type: typeof IS_COURSE_PAGE
          payload: boolean
      }

export type UiState = Readonly<{
    nav: 'opened' | 'closed' | 'progress'
    navToggle: 'open' | 'close'
    isMobile: boolean
    isCoursePage: boolean
}>
export const initUiState: UiState = {
    nav: 'closed',
    navToggle: 'close',
    isMobile: false,
    isCoursePage: false,
}

// export type UiState = Readonly<typeof initUiState>

export function uiReducer(
    state: Draft<UiState> = initUiState,
    action: UiActions
): UiState {
    switch (action.type) {
        case TOGGLE_NAV_PANEL: {
            if (state.navToggle === 'close') {
                state.navToggle = 'open'
            } else {
                state.navToggle = 'close'
            }
            break
        }
        case NAV_ANIM_FININISHED: {
            if (state.navToggle === 'open') {
                state.nav = 'opened'
            } else if (state.navToggle === 'close') {
                state.nav = 'closed'
            }
            break
        }
        case NAV_ANIM_PROGRESS: {
            state.nav = 'progress'
            break
        }
        case IS_MOBILE: {
            state.isMobile = true
            break
        }
        case IS_COURSE_PAGE: {
            state.isCoursePage = action.payload
            break
        }
        default:
            return state
    }
}
