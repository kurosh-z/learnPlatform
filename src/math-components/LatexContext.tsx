import React, {
    useRef,
    useContext,
    createContext,
    useEffect,
    useState,
    useCallback,
} from 'react'
import { PBBox } from './parser/Parser'

type LatexBBox = { [key: string]: PBBox }
type LatexBBoxRef = React.MutableRefObject<LatexBBox>
// type SetLatexBBox = ({ bbox: PBBox, id: string }) => void;
type SetLatexBBox = ({
    latexId,
    bbox,
}: {
    latexId: string
    bbox: PBBox
}) => void

export type LatexContextType = [LatexBBoxRef, SetLatexBBox]

const LatexContext = createContext<LatexContextType>([null, () => {}])

export const useLatexBBox: () => LatexContextType = () =>
    useContext<LatexContextType>(LatexContext)

export const LatexProvider = ({ children }: { children: React.ReactNode }) => {
    const latexBBoxRef = useRef<LatexBBox>({})

    const setLatexBBox = useCallback(
        ({ latexId, bbox }: { latexId: string; bbox: PBBox }) => {
            const newBBox = {}
            Object.defineProperty(newBBox, latexId, {
                value: bbox,
                enumerable: true,
            })

            latexBBoxRef.current = { ...latexBBoxRef.current, ...newBBox }
        },

        []
    )
    const contexVal: [LatexBBoxRef, SetLatexBBox] = [latexBBoxRef, setLatexBBox]

    return (
        <LatexContext.Provider value={contexVal}>
            {children}
        </LatexContext.Provider>
    )
}
