import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import HomePage from './homepage/HomePage'

const ExampleCourse = lazy(() =>
    import(/* webpackPrefetch: true */ './Courses/exampleCourse/ExampleCourse')
)

import './App.css'

const App: React.FC<{}> = () => {
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
