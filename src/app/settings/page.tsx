import Settings from "../components/settings";
import AdminPanel from "../components/adminPanel";

export default function SettingsPage() {
  return (
    <div className="m-4">
      <div className="flex-1 flex items-center justify-center w-full h-full">
        <Settings />

      </div>
      <div className="mt-6 flex-1 flex items-center justify-center w-full h-full">
        <AdminPanel />

      </div>
    </div>
  );
}
