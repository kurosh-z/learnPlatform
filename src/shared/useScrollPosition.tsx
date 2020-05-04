import { useRef } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

const isBrowser = typeof window !== `undefined`

function getScrollPosition({
    element,
    useWindow,
}: {
    element?: any
    useWindow: boolean
}): { x: number; y: number } {
    if (!isBrowser) return { x: 0, y: 0 }

    const target = element ? element.current : document.body
    const position = target.getBoundingClientRect()

    return useWindow
        ? { x: window.scrollX, y: window.scrollY }
        : { x: position.left, y: position.top }
}

type EffectFunc = ({
    prevPos,
    currPos,
}: {
    prevPos: { x: number; y: number }
    currPos: { x: number; y: number }
}) => void

export default function useScrollPosition(
    effect: EffectFunc,
    deps: [],
    element?,
    useWindow?: boolean,
    wait?: number
) {
    const prevPos = useRef(getScrollPosition({ useWindow }))

    let throttleTimeout = null

    const callBack = () => {
        const currPos = getScrollPosition({ element, useWindow })
        effect({ prevPos: prevPos.current, currPos })
        prevPos.current = currPos
        throttleTimeout = null
    }

    useIsomorphicLayoutEffect(() => {
        if (!isBrowser) {
            return
        }

        const handleScroll = () => {
            if (wait) {
                if (throttleTimeout === null) {
                    throttleTimeout = setTimeout(callBack, wait)
                }
            } else {
                callBack()
            }
        }

        window.addEventListener('scroll', handleScroll)

        return () => window.removeEventListener('scroll', handleScroll)
    }, deps)
}
