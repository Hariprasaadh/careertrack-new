// File: src/components/UserForm.tsx
import { useState } from "react";

interface UserFormProps {
  onSubmit: (usernames: {
    leetcode: string;
    hackerrank: string;
    codechef: string;
    codeforces: string;
  }) => void;
}

export default function UserForm({ onSubmit }: UserFormProps) {
  const [usernames, setUsernames] = useState({
    leetcode: "",
    hackerrank: "",
    codechef: "",
    codeforces: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUsernames((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(usernames);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Enter Your Usernames</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="leetcode" className="block text-sm font-medium text-slate-300 mb-1">
              LeetCode
            </label>
            <input
              type="text"
              id="leetcode"
              name="leetcode"
              value={usernames.leetcode}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
              placeholder="LeetCode username"
            />
          </div>
          
          <div>
            <label htmlFor="codechef" className="block text-sm font-medium text-slate-300 mb-1">
              CodeChef
            </label>
            <input
              type="text"
              id="codechef"
              name="codechef"
              value={usernames.codechef}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
              placeholder="CodeChef username"
            />
          </div>
          <div>
            <label htmlFor="codeforces" className="block text-sm font-medium text-slate-300 mb-1">
              Codeforces
            </label>
            <input
              type="text"
              id="codeforces"
              name="codeforces"
              value={usernames.codeforces}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
              placeholder="Codeforces username"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Track My Progress
        </button>
      </form>
    </div>
  );
}