import { useNavigate } from "react-router-dom";

export function useNavigation() {
  const navigate = useNavigate();

  const goTo = (path: string, options?: { replace?: boolean }) => {
    navigate(path, options);
  };

  return {
    goTo,
  };
}
