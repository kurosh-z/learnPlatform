import React, { useRef, useEffect, useMemo } from 'react'

import { MathCss } from './parser'

// const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
// const LETTERS = 'ABCDEFGHIJKLMOPQRSTUVWXZ';
// const LETTERS = 'αβγΓδΔϵζηθΘιIκλΛμνοπΠρσΣτυϕΦχΞξψΨω';
// const LETTERS = '0123456789';
// const LETTERS = '()[]{}`ˊ′˘ˉ~!?<>,.@#$%^&*_-=+÷×\\|∞';
const LETTERS = '-'
const STYLES = ['normal', 'bold', 'italic']

type FontMetrics = {
    [key: string]: { normal: number[]; italic: number[]; bold: number[] }
}
const Calibrator: React.FC<{}> = () => {
    const canvRef = useRef<HTMLCanvasElement>(null)
    const { textCss } = useMemo(() => {
        const mathcss = new MathCss(1)
        const textCss = mathcss.css
        return { textCss }
    }, [])

    useEffect(() => {
        if (canvRef.current) {
            const fontMet = {}
            let i = 0,
                j = 0
            for (const char of LETTERS) {
                Object.defineProperty(fontMet, char, {
                    value: { normal: [], italic: [], bold: [] },
                    enumerable: true,
                })
                for (const style of STYLES) {
                    const { width, ascent, descent } = calFontMetrics({
                        char: char,
                        fontFamily: 'KaTeX_Math',
                        fontStyle: style,
                        canvas: canvRef.current,
                        i,
                        j,
                    })
                    fontMet[char][style] = [width, ascent, descent]
                    // console.log(char, style, width, ascent, descent);
                    // console.log('-------------------------');
                    i++
                }
                i = 0
                j++
            }
            console.log(JSON.stringify(fontMet))

            // const fontMet: FontMetrics = {};
            // Object.defineProperty(fontMet, char, {
            //   value:
            // });
            // setFontMetrics((curr: FontMetrics) => {
            //   return { ...curr };
            // });
            // console.log(textMetrics);
            // console.log(
            //   'last',
            //   Math.abs(textMetrics.actualBoundingBoxLeft) +
            //     Math.abs(textMetrics.actualBoundingBoxRight)
            // );
        }
    }, [])

    return (
        <>
            {/* <svg
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        css={textCss}
        style={{ position: 'absolute', top: '150px' }}
        width={1000}
        height={1000}>
        <text
          style={{ lineHeight: '1.4rem' }}
          x={100}
          y={100}
          className='math_letter normalsize'
          ref={textRef}>
          > ffff
        </text>
      </svg> */}
            <canvas
                style={{ position: 'absolute', bottom: 0 }}
                id="canvas"
                ref={canvRef}
                width="1000"
                height="1000"
            ></canvas>
        </>
    )
}
// 1210001.12500000
export default Calibrator

function calFontMetrics({
    canvas,
    char,
    fontFamily,
    fontStyle,
    i,
    j,
}: {
    canvas: HTMLCanvasElement
    char: string
    fontStyle: string
    fontFamily: string
    i: number
    j: number
}) {
    const ctx = canvas.getContext('2d')
    ctx.font = `${fontStyle} 16px ${fontFamily}`
    const textMetrics = ctx.measureText(char)
    const ret = {
        width: textMetrics.width,
        ascent: textMetrics.actualBoundingBoxAscent,
        descent: textMetrics.actualBoundingBoxDescent,
    }
    const pos = { x: 100 + i * 56, y: 100 + j * 40 }
    ctx.fillText(char, pos.x, pos.y)

    return ret
}
