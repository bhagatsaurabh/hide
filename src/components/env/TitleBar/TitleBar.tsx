import { useEffect, useState } from "react";
import classes from "./TitleBar.module.css";

const TitleBar = () => {
  useEffect(() => {
    console.log("Mounted: TitleBar");
    return () => console.log("Unmounted: TitleBar");
  }, []);
  const [count, setCount] = useState(0);

  return (
    <div style={{ border: "1px solid purple", padding: "10px" }}>
      <h4>View A</h4>
      <p>Internal Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment A</button>
    </div>
  );
};

export default TitleBar;
