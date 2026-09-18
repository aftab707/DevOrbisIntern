import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiFetching = () => {
  // 1. State for data and loading status
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. USEEFFECT: 
  // This hook runs automatically when the component loads.
  // The [] (empty array) at the end means "only run this once on mount".
  useEffect(() => {
    // Define an async function to fetch data from the internet
    const fetchTodos = async () => {
      try {
        // Fetch data from JSONPlaceholder (a fake API) using Axios
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos?_limit=3');
        
        // Update state with the received data
        setTodos(response.data);
        setLoading(false); // Turn off loading status
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchTodos(); // Call the function
  }, []); // <-- Empty dependency array is very important here

  return (
    <div style={{ padding: '20px', marginTop: '20px', borderTop: '2px solid black' }}>
      <h2>Topic 3 & 4: useEffect and API Fetching (Axios)</h2>
      
      {/* Show a loading message if the data is still being fetched */}
      {loading ? (
        <p>Loading data, please wait...</p>
      ) : (
        // Map through the data and display it on the screen once available
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.title} - {todo.completed ? '✅' : '❌'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApiFetching;
