import { AppConfiguration } from "../abstractions";
import { AxiosStatic } from "axios";
import { DopplerLegacyClientImpl } from "./DopplerLegacyClientImpl";

const baseUrl = "https://app2.dopplerfiles.com/Users/88469/Originals";

function createTestContext({
  dopplerLegacyBaseUrl = "",
}: { dopplerLegacyBaseUrl?: string } = {}) {
  const appConfiguration = {
    dopplerLegacyBaseUrl,
  } as AppConfiguration;

  const get = jest.fn(() =>
    Promise.resolve({
      data: { images: [] } as any,
    })
  );

  const postForm = jest.fn(() => Promise.resolve({ data: { success: true } }));

  const create = jest.fn(() => ({
    get,
    postForm,
  }));

  const axiosStatic = {
    create,
  } as unknown as AxiosStatic;

  const sut = new DopplerLegacyClientImpl({
    axiosStatic,
    appConfiguration,
  });
  return { sut, axiosCreate: create, axiosGet: get, axiosPostForm: postForm };
}

describe(DopplerLegacyClientImpl.name, () => {
  describe("getImageGallery", () => {
    it("Should request backend and parse response", async () => {
      // Arrange
      const dopplerLegacyBaseUrl = "dopplerLegacyBaseUrl";
      const searchTerm = "searchTerm";
      const continuation = "5";
      const expectedUrl =
        "/Campaigns/Editor/GetImageGallery?offset=50&position=5&query=searchTerm&sortingCriteria=DATE";

      // cSpell:disable
      const getApiResponse = {
        images: [
          {
            name: "sombrerito(1).jpg",
            lastModifiedDate: "03/09/2023 05:57:07 PM",
            size: "132165",
            type: ".jpg",
            url: `${baseUrl}/sombrerito(1).jpg`,
            thumbnailUrl: `${baseUrl}/mcith/mcith_sombrerito(1).jpg`,
            thumbnailUrl150: `${baseUrl}/mcith/sombrerito(1).jpg`,
          },
          {
            name: "sombrerito.jpg",
            lastModifiedDate: "10/13/2022 02:56:55 AM",
            size: "111745",
            type: ".jpg",
            url: `${baseUrl}/sombrerito.jpg`,
            thumbnailUrl: `${baseUrl}/mcith/mcith_sombrerito.jpg`,
            thumbnailUrl150: `${baseUrl}/mcith/sombrerito.jpg`,
          },
          {
            name: "2022-02-22_15-49-20.png",
            lastModifiedDate: "02/22/2022 06:50:03 PM",
            size: "2640",
            type: ".png",
            url: `${baseUrl}/2022-02-22_15-49-20.png`,
            thumbnailUrl: `${baseUrl}/mcith/mcith_2022-02-22_15-49-20.png`,
            thumbnailUrl150: `${baseUrl}/mcith/2022-02-22_15-49-20.png`,
          },
        ],
        count: 8,
      };

      const expectedResultValue = {
        items: [
          {
            extension: ".jpg",
            lastModifiedDate: new Date("2023-03-09T17:57:07.000Z"),
            name: "sombrerito(1).jpg",
            size: 132165,
            thumbnailUrl: `${baseUrl}/mcith/mcith_sombrerito(1).jpg`,
            thumbnailUrl150: `${baseUrl}/mcith/sombrerito(1).jpg`,
            url: `${baseUrl}/sombrerito(1).jpg`,
          },
          {
            extension: ".jpg",
            lastModifiedDate: new Date("2022-10-13T02:56:55.000Z"),
            name: "sombrerito.jpg",
            size: 111745,
            thumbnailUrl: `${baseUrl}/mcith/mcith_sombrerito.jpg`,
            thumbnailUrl150: `${baseUrl}/mcith/sombrerito.jpg`,
            url: `${baseUrl}/sombrerito.jpg`,
          },
          {
            extension: ".png",
            lastModifiedDate: new Date("2022-02-22T18:50:03.000Z"),
            name: "2022-02-22_15-49-20.png",
            size: 2640,
            thumbnailUrl: `${baseUrl}/mcith/mcith_2022-02-22_15-49-20.png`,
            thumbnailUrl150: `${baseUrl}/mcith/2022-02-22_15-49-20.png`,
            url: `${baseUrl}/2022-02-22_15-49-20.png`,
          },
        ],
      };
      // cSpell:enable

      const { sut, axiosCreate, axiosGet } = createTestContext({
        dopplerLegacyBaseUrl,
      });

      axiosGet.mockResolvedValue({ data: getApiResponse });

      // Act
      const result = await sut.getImageGallery({
        searchTerm,
        continuation,
      });

      // Assert
      expect(axiosCreate).toBeCalledWith({
        baseURL: dopplerLegacyBaseUrl,
        withCredentials: true,
      });
      expect(axiosGet).toBeCalledWith(expectedUrl);

      expect(result).toEqual({
        success: true,
        value: expectedResultValue,
      });
    });

    it("Should encode the search terms", async () => {
      // Arrange
      const searchTerm = '%search "term"!';
      const expectedSearchTerm = "%25search%20%22term%22!";
      const expectedUrl =
        `/Campaigns/Editor/GetImageGallery?` +
        `offset=50&position=0&query=${expectedSearchTerm}&sortingCriteria=DATE`;

      const { sut, axiosGet } = createTestContext();

      // Act
      await sut.getImageGallery({ searchTerm });

      // Assert
      expect(axiosGet).toBeCalledWith(expectedUrl);
    });

    it("Should accept empty search terms", async () => {
      // Arrange
      const searchTerm = "";
      const expectedUrl =
        "/Campaigns/Editor/GetImageGallery?offset=50&position=0&query=&sortingCriteria=DATE";

      const { sut, axiosGet } = createTestContext();

      // Act
      await sut.getImageGallery({ searchTerm });

      // Assert
      expect(axiosGet).toBeCalledWith(expectedUrl);
    });

    it("Should accept undefined continuation", async () => {
      // Arrange
      const searchTerm = "searchTerm";
      const expectedUrl =
        "/Campaigns/Editor/GetImageGallery?offset=50&position=0&query=searchTerm&sortingCriteria=DATE";

      const { sut, axiosGet } = createTestContext();

      // Act
      await sut.getImageGallery({
        searchTerm,
      });

      // Assert
      expect(axiosGet).toBeCalledWith(expectedUrl);
    });
  });

  describe("uploadFile", () => {
    it("Should request backend", async () => {
      // Arrange
      const dopplerLegacyBaseUrl = "dopplerLegacyBaseUrl";
      const { sut, axiosCreate, axiosPostForm } = createTestContext({
        dopplerLegacyBaseUrl,
      });
      const file = { my: "file" } as any;

      // Act
      const result = await sut.uploadImage(file);

      // Assert
      expect(axiosCreate).toBeCalledWith({
        baseURL: dopplerLegacyBaseUrl,
        withCredentials: true,
      });
      expect(axiosPostForm).toBeCalledWith("/Campaigns/Editor/UploadImage", {
        file,
      });
      expect(result).toEqual({
        success: true,
      });
    });
  });
});
