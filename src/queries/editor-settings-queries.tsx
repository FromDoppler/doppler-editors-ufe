import { QueryFunction, useQuery } from "@tanstack/react-query";
import { useAppServices } from "../components/AppServicesContext";
import { DopplerEditorSettings } from "../abstractions/domain/DopplerEditorSettings";

export const useGetEditorSettings = () => {
  const { dopplerLegacyClient } = useAppServices();

  const queryKey = [
    {
      scope: "editor-settings",
    },
  ];

  const queryFn: QueryFunction<DopplerEditorSettings> = async () => {
    const result = await dopplerLegacyClient.getEditorSettings();
    return result.value;
  };

  const query = useQuery({
    queryKey,
    queryFn,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return query;
};
