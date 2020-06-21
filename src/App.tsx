import React, { Suspense, lazy, useLayoutEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { IS_MOBILE } from './app_states/reducers/ui'
import { useUiDispatch } from './app_states/stateContext'
// import ExampleCourse from './Courses/exampleCourse/ExampleCourse'
// import HomePage from './homepage/HomePage'
import './App.css'
import HomePage from './homepage/HomePage'

const ExampleCourse = lazy(() =>
    import(/* webpackPrefetch: true */ './Courses/exampleCourse/ExampleCourse')
)

const App: React.FC<{}> = () => {
    const uiDispatch = useUiDispatch()
    useLayoutEffect(() => {
        if (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            )
        ) {
            uiDispatch({ type: IS_MOBILE })
        }
    }, [])
    return (
        <Suspense fallback={null}>
            <Router>
                <Switch>
                    <Route path="/" exact component={HomePage} />
                    <Route path="/courses" component={ExampleCourse} />
                </Switch>
            </Router>
        </Suspense>
    )
}

export default App

// import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
// import { animated, useSpring, config, SpringStartFn } from 'react-spring'
// import './App.css'

// let globalNonce: object
// const Box: React.FC<{
//     width: number
//     transform?: string
//     background: string
// }> = ({ width, transform = 'translate(100px, 100px)', background }) => {
//     return (
//         <div
//             style={{
//                 position: 'absolute',
//                 background,
//                 transform: transform,
//                 zIndex: 3000,
//                 width,
//                 height: 100,
//             }}
//         />
//     )
// }
// const Abox = animated(Box)

// type Queue = {
//     setFn: SpringStartFn<any>
//     props: object
// }[]

// function usePrev(val: number) {
//     const ref = useRef(null)
//     useEffect(() => {
//         ref.current = val
//     }, [val])
//     return ref.current
// }

// const BoxSet: React.FC<{ bwidth: number; rwidth: number }> = ({
//     bwidth = 20,
//     rwidth = 30,
// }) => {
//     const [spring, setSpring] = useSpring<{
//         width: number
//         transform: string
//         background: string
//     }>(() => ({
//         width: bwidth,
//         transform: 'translate(30px, 400px)',
//         background: 'blue',
//     }))
//     const [spring2, setSpring2] = useSpring<{
//         width: number
//         transform: string
//         background: string
//     }>(() => ({
//         width: rwidth,
//         transform: 'translate(30px, 200px)',
//         background: 'red',
//     }))

//     const prevRWidth = usePrev(rwidth)
//     const prevBWidth = usePrev(bwidth)

//     const init_queue = useCallback(() => {
//         const update = [] as Queue
//         for (let i = 0; i < 800; i += 30) {
//             update.push({
//                 setFn: setSpring,
//                 props: { width: i, config: config.slow },
//             })
//             update.push({
//                 setFn: setSpring2,
//                 props: { width: 830 - i, config: config.slow },
//             })
//         }

//         return update
//     }, [])
//     const [queue, setQueue] = useState<Queue>(init_queue())

//     const flushGenerator = useCallback(
//         function* prepare() {
//             for (const anim of queue) {
//                 yield Promise.resolve(anim.setFn(anim.props))
//             }
//         },
//         [queue]
//     )

//     const createFlush = useCallback((_flushGenerator) => {
//         return async function () {
//             const localNonce = (globalNonce = new Object())
//             const iterator = _flushGenerator()
//             let resumeVal
//             for (;;) {
//                 const n = iterator.next(resumeVal)
//                 if (n.done) {
//                     return n.value
//                 }
//                 resumeVal = await n.value
//                 if (localNonce !== globalNonce) {
//                     return
//                 }
//             }
//         }
//     }, [])

//     useMemo(() => {
//         if (prevBWidth !== null) {
//             const update = []
//             console.log('new r||b width')
//             update.push({
//                 setFn: setSpring,
//                 props: { width: bwidth, config: config.molasses },
//             })
//             update.push({
//                 setFn: setSpring2,
//                 props: { width: rwidth, config: config.molasses },
//             })
//             setQueue(() => update)
//         }
//     }, [setSpring, setSpring2, bwidth, rwidth])

//     const flush = useMemo(() => {
//         return createFlush(flushGenerator)
//     }, [queue])

//     useEffect(() => {
//         console.log('useEffect')
//         flush()
//     }, [bwidth, rwidth])

//     return (
//         <>
//             <Abox
//                 width={spring.width}
//                 transform={spring.transform}
//                 background={spring.background}
//             />

//             <Abox
//                 width={spring2.width}
//                 transform={spring2.transform}
//                 background={spring2.background}
//             />
//         </>
//     )
// }
// function App() {
//     const [bwidth, setBwidth] = useState(20)
//     const [rwidth, setRwidth] = useState(50)

//     return (
//         <div className="App">
//             <p> this is a test app </p>
//             <BoxSet bwidth={bwidth} rwidth={rwidth} />
//             <input
//                 style={{
//                     width: 500,
//                 }}
//                 type="range"
//                 max={800}
//                 min={0}
//                 step={10}
//                 value={bwidth}
//                 onChange={(ev) => {
//                     setBwidth(parseFloat(ev.target.value))
//                 }}
//             />
//             <input
//                 style={{
//                     width: 500,
//                 }}
//                 type="range"
//                 max={800}
//                 min={0}
//                 step={10}
//                 value={rwidth}
//                 onChange={(ev) => {
//                     setRwidth(parseFloat(ev.target.value))
//                 }}
//             />
//         </div>
//     )
// }

// export default App
