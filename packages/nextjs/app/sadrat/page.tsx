import type { NextPage } from "next";

const SadratDisclosure: NextPage = () => {
  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold text-white">Sadrat Disclosure</span>
        </h1>
        <div className="max-w-2xl bg-slate-900 p-8 rounded-2xl border border-slate-800 text-slate-300">
          <p className="mb-4">Place your disclosure details here.</p>
          {/* Add your specific content here */}
        </div>
      </div>
    </div>
  );
};

export default SadratDisclosure;
