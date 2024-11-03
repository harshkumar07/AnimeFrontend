// /context/SearchContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Anime {
  id: string;
  title: string;
  image: string;
  releaseDate: string | null;
  subOrDub: "sub" | "dub";
}

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: Anime[];
  setResults: (results: Anime[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  hasNextPage: boolean;
  setHasNextPage: (hasNextPage: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  return (
    <SearchContext.Provider value={{ query, setQuery, results, setResults, loading, setLoading, hasNextPage, setHasNextPage }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
