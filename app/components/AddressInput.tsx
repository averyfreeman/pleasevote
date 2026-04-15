import { useState, useEffect } from "react";
import { Form, useNavigate } from "react-router";
import { MapPin, Search } from "lucide-react";

/**
 * AddressInput Component.
 * Optimized for larger viewports (>800px) to prevent truncation.
 */
export default function AddressInput() {
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedAddress = localStorage.getItem("address");
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      localStorage.setItem("address", address.trim());
      navigate(`/voterinfo?address=${encodeURIComponent(address.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group max-w-2xl lg:max-w-4xl w-full">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
        <MapPin className="h-8 w-8 text-onehalf-blue" />
      </div>
      <input
        type="text"
        placeholder="Enter your address for local info..."
        className="block w-full pl-16 pr-24 py-8 bg-onehalf-dark border-4 border-neutral-800 rounded-3xl text-xl md:text-2xl font-black text-white focus:outline-none focus:ring-8 focus:ring-onehalf-blue/20 focus:border-onehalf-blue transition-all"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <button
        type="submit"
        className="absolute inset-y-2 right-2 px-8 flex items-center bg-onehalf-green text-neutral-900 rounded-2xl font-black text-lg md:text-xl uppercase tracking-tighter hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg"
      >
        <Search className="h-6 w-6 mr-2" />
        Find
      </button>
    </form>
  );
}
