import { Result } from "../common/result-types";
import { ImageItem } from "../domain/image-gallery";

export interface DopplerLegacyClient {
  getImageGallery: ({
    searchTerm,
    continuation,
  }: {
    searchTerm: string;
    continuation?: string | undefined;
  }) => Promise<Result<{ items: ImageItem[] }>>;
  uploadImage: (file: File) => Promise<Result>;
}
