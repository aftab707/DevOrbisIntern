import React, { useState } from 'react';

// 1. COMPONENT & PROPS: 
// This is a small Component. It receives "name" and "role" from the outside as "props".
const UserCard = ({ name, role }) => {
  return (
    <div style={{ border: '1px solid gray', padding: '10px', margin: '10px' }}>
      <h3>Name: {name}</h3>
      <p>Role: {role}</p>
    </div>
  );
};

// 2. MAIN COMPONENT & USESTATE:
const ReactBasics = () => {
  // useState explanation:
  // 'count' is our variable.
  // 'setCount' is the function that will update this variable.
  // (0) is the initial value.
  const [count, setCount] = useState(0);

  // State for text input
  const [text, setText] = useState("");

  return (
    <div style={{ padding: '20px' }}>
      <h2>Topic 1: Components & Props</h2>
      {/* We can reuse the same component by passing different data (props) */}
      <UserCard name="Ali" role="Backend Developer" />
      <UserCard name="Ahmed" role="Frontend Developer" />

      <hr />

      <h2>Topic 2: useState (State Management)</h2>
      {/* State updates when the button is clicked */}
      <p>You clicked the button {count} times.</p>
      <button onClick={() => setCount(count + 1)}>
        Click Me!
      </button>
      
      <br /><br />

      {/* Screen updates immediately as you type in the input */}
      <input 
        type="text" 
        placeholder="Type something..." 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
      />
      <p>You are typing: <strong>{text}</strong></p>

    </div>
  );
};

export default ReactBasics;
