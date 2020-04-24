import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import HomePage from './homepage/HomePage';
import ExCourse from './Courses/ExCourse';

import './App.css';

const App: React.FC<{}> = () => {
  return (
    <Router>
      <Switch>
        <Route path='/' exact component={HomePage} />
        <Route path='/courses' component={ExCourse} />
      </Switch>
    </Router>
  );
};

export default App;
