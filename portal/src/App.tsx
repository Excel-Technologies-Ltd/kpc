import { useFrappeAuth } from 'frappe-react-sdk';

function App() {
  const { currentUser } = useFrappeAuth();

  console.log(currentUser);

  return (
    <div className='App'>
      <h1>Hello World</h1>
    </div>
  );
}

export default App;
