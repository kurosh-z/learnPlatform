import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import HomePage from './homepage/HomePage';
import Prob01 from './Courses/Prob01';

import './App.css';

const App: React.FC<{}> = () => {
  return (
    <Router>
      <Switch>
        <Route path='/' exact component={HomePage} />
        <Route path='/courses' component={Prob01} />
      </Switch>
    </Router>
  );
};

export default App;
