import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import HomePage from './homepage/HomePage';

const ExCourse = lazy(() => import('./Courses/ExCourse'));

import './App.css';

const App: React.FC<{}> = () => {
  return (
    <Suspense fallback={null}>
      <Router>
        <Switch>
          <Route path='/' exact component={HomePage} />
          <Route path='/courses' component={ExCourse} />
        </Switch>
      </Router>
    </Suspense>
  );
};

export default App;
