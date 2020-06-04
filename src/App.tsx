import React, { Suspense, lazy, useLayoutEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { IS_MOBILE, SET_ASPECT_RATIO, SET_SIZE } from './app_states/reducers/ui'
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

// const App: React.FC<{}> = () => {
//     return <HomePage />
// }

export default App
