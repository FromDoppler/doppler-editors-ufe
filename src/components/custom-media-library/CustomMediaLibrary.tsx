// TODO: implement it based on MSEditor Gallery

import { ImageItem } from "../../abstractions/domain/image-gallery";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { List } from "./List";
import { useCustomMediaLibraryBehavior } from "./useCustomMediaLibraryBehavior";

export const CustomMediaLibrary = ({
  cancel,
  selectImage,
}: {
  cancel: () => void;
  selectImage: ({ url }: { url: string }) => void;
}) => {
  const customMediaLibraryUIProps = useCustomMediaLibraryBehavior({
    selectImage,
  });
  return (
    <CustomMediaLibraryUI
      cancel={cancel}
      selectImage={selectImage}
      {...customMediaLibraryUIProps}
    />
  );
};

export const CustomMediaLibraryUI = ({
  selectCheckedImage,
  uploadImage,
  cancel,
  selectImage,
  isFetching,
  images,
  checkedImages,
  toggleCheckedImage,
  searchTerm,
  setSearchTerm,
}: {
  selectCheckedImage: (() => void) | null;
  uploadImage: (file: File) => void;
  cancel: () => void;
  selectImage: ({ url }: { url: string }) => void;
  isFetching: boolean;
  images: ImageItem[];
  checkedImages: ReadonlySet<string>;
  toggleCheckedImage: ({ name }: { name: string }) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) => (
  <form
    className="dp-image-gallery"
    onSubmit={(e) => {
      if (selectCheckedImage) {
        selectCheckedImage();
      }
      e.preventDefault();
      return false;
    }}
  >
    <Header
      cancel={cancel}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
    <List
      isFetching={isFetching}
      images={images}
      checkedImages={checkedImages}
      toggleCheckedImage={toggleCheckedImage}
      selectImage={selectImage}
    />
    <Footer submitEnabled={!!selectCheckedImage} uploadImage={uploadImage} />
  </form>
);
