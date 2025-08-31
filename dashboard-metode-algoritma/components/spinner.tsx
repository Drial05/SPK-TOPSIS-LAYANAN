import { Loader2 } from "lucide-react";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center left-4">
      <Loader2 className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
    </div>
  );
}
