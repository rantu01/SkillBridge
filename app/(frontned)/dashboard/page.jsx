import DashboardHome from "./components/DashboardHome";

export default function DashboardPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="rounded-lg h-96 flex items-center justify-center mt-40">
        <DashboardHome></DashboardHome>
      </div>
    </div>
  );
}