import React from "react";
import { ThreadTracker } from "../components/GoldenThread/ThreadTracker";

export const ThreadPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <ThreadTracker />
    </div>
  );
};

export default ThreadPage;
