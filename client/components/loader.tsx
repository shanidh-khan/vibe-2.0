"use client";

const Loader = () => {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
};

export default Loader;
