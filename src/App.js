import logo from './logo.svg';
import './App.css';
import Name from './component/Name';

function App() {
  console.log('Come on guys, keept it up!')
  return (
    <div className="App">
      <header>
      <h1> Reema
        <Name/>
      </h1>
      </header>
    </div>
  );
}

export default App;
