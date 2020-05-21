import React, { Suspense, lazy } from 'react'
// import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import HomePage from './homepage/HomePage'
// import HomePage from './homepage/HomePage'

// const ExampleCourse = lazy(() =>
//     import(/* webpackPrefetch: true */ './Courses/exampleCourse/ExampleCourse')
// )

import './App.css'

const App: React.FC<{}> = () => {
    return <HomePage />
}

export default App
