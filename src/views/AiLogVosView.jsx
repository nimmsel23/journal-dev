import { useState } from "react";
import JournalV2View from "./v2/JournalV2View.jsx";

// The standalone Smart Log route shares Journal's review and recovery flow.
export default function AiLogVosView({ date, onDateChange, user }) {
  const [mode, setMode] = useState("tag");
  return (
    <JournalV2View
      date={date}
      onDateChange={onDateChange}
      user={user}
      mode={mode}
      onModeChange={setMode}
      startSmart
    />
  );
}
