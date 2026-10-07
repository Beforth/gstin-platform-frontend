import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon } from "@/components/ui/icons";

export default function NotFound({ forbidden = false }) {
  const nav = useNavigate();
  return (
    <EmptyState
      className="mt-10"
      icon={<SearchIcon />}
      title={forbidden ? "You do not have access to this page" : "That page does not exist"}
      description={forbidden ? "It is only available to administrators." : "The link may be old, or the page may have moved."}
      action={<Button onClick={() => nav("/overview")}>Back to overview</Button>}
    />
  );
}
