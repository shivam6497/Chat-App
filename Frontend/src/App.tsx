import{ useState, useEffect, useRef } from "react";

function App() {
  const[socket, setSocket] = useState();
  // @ts-ignore
  const inputRef = useRef();

  function sendMessage() {
    if(!socket) return;
    // @ts-ignore
    const message = inputRef.current.value;
    // @ts-ignore
    socket.send(message);
  }

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    // @ts-ignore
    setSocket(socket);


    socket.onmessage = (e) => {
      alert(e.data);
    }
  }, []);

  return <div>
    <input ref={inputRef} type="text" placeholder="Message...."/>
    <button onClick={sendMessage}>Send</button>
  </div>
}

export default App;