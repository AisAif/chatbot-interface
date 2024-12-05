import { Route, Routes } from "react-router";
import Chat from "./pages/Chat/Index";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Chat />} />
    </Routes>
  );
}

export default App;
