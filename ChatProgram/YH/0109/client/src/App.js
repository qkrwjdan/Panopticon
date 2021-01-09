import React from 'react'
import { BrowserRouter, Route, Switch} from 'react-router-dom'
import CreateRoom from './routes/CreateRoom'
import Room from './routes/Room'
import './App.css'

function App(){
  return (
    <div className='App'>
      <BrowserRouter>
        <Switch>
          <Route path='/' exact component={CreateRoom} />
          <Route path='/room/:roomID' component={Room} />
        </Switch>
      </BrowserRouter>
    </div>
  )
}

export default App;

/*import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/