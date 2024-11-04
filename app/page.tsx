import TopAiring from "@/Pages/TopAiring";
import React from "react";

const HomePage: React.FC = () => {
  return (
    <main className="w-full h-full">
      <TopAiring /> {/* Ensure TopAiring handles the className prop */}
    </main>
  );
};

export default HomePage;
