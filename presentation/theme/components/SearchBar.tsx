import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Buscar"
        className="w-full h-9 px-4 pr-12 rounded-lg border border-light-gray bg-white text-[15px] placeholder:text-light-gray focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
      />
      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-[30px] h-[30px] text-black" />
    </div>
  );
}
