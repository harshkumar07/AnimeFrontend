// app/page.tsx (or pages/index.tsx if you're not using the app directory)
import TopAiring from "@/Pages/TopAiring";
import React from "react";


const HomePage: React.FC = () => {
  return (
    <main className="w-full">
      
    <TopAiring/>
    </main>
  );
};

export default HomePage;
