
import { Fragment } from 'react';
import './App.css';
import Navbar from './components/layouts/Navbar';
import Landing from './components/layouts/Landing';

function App() {
  return (
   <Fragment>
      <Navbar/>
      <Landing/>
   </Fragment>
  );
}

export default App;
