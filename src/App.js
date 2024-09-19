import logo from './logo.svg';
import './App.css';
<<<<<<< HEAD
import Name from './component/Name';

function App() {
  console.log('Come on guys, keept it up!')
  return (
    <div className="App">
      <header>
      <h1> Reema
        <Name/>
      </h1>
=======

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
>>>>>>> 2af2fe0 (Initialize project using Create React App)
      </header>
    </div>
  );
}

export default App;
