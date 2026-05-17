import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const UserSearch = ({ className = "" }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/u/${query.trim()}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative flex items-center ${className}`}>
      <Search className="absolute left-2.5 w-4 h-4 text-zinc-500" />
      <Input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-8 w-32 md:w-48 pl-8 bg-zinc-900/50 border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-full transition-all focus:w-48 md:focus:w-64"
      />
    </form>
  );
};

export default UserSearch;
