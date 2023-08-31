import { useState } from "react";
import { useSaving } from "./useSaving";
import { SavingProcessData } from "./reducer";
import { UnlayerEditorObject } from "../../abstractions/domain/editor";
import { Content } from "../../abstractions/domain/content";
import { act, render, waitFor } from "@testing-library/react";
import { Design, HtmlExport, ImageExport } from "react-email-editor";
import { noop } from "../../utils";

function createUnlayerObjectDouble({
  exportedDesign,
  exportedHtml = "",
  exportedImageUrl = "",
}: {
  exportedDesign?: Design;
  exportedHtml?: string;
  exportedImageUrl?: string;
} = {}) {
  const exportHtmlAsync = jest.fn(() =>
    Promise.resolve({
      design: exportedDesign,
      html: exportedHtml,
    }),
  );
  const exportImageAsync = jest.fn(() =>
    Promise.resolve({
      design: exportedDesign,
      url: exportedImageUrl,
    }),
  );
  return {
    unlayerEditorObject: {
      exportHtmlAsync: exportHtmlAsync as () => Promise<HtmlExport>,
      exportImageAsync: exportImageAsync as () => Promise<ImageExport>,
    } as UnlayerEditorObject,
    mocks: {
      exportHtmlAsync,
      exportImageAsync,
    },
  };
}

const createTestContext = () => {
  let currentSmartSave: () => void;
  let currentForceSave: () => void;
  let currentExportContent: () => Promise<Content | undefined>;
  let currentSetSavingProcessData: (_: SavingProcessData) => void;
  let currentSetUnlayerEditorObject: (
    _: UnlayerEditorObject | undefined,
  ) => void;

  const dispatch = jest.fn();
  const onSave = jest.fn();

  const TestComponent = () => {
    const [savingProcessData, setSavingProcessData] =
      useState<SavingProcessData>(null);
    currentSetSavingProcessData = setSavingProcessData;

    const [unlayerEditorObject, setUnlayerEditorObject] =
      useState<UnlayerEditorObject>();
    currentSetUnlayerEditorObject = setUnlayerEditorObject;

    const saving = useSaving({
      dispatch,
      onSave,
      savingProcessData,
      unlayerEditorObject,
    });
    currentSmartSave = saving.smartSave;
    currentForceSave = saving.forceSave;
    currentExportContent = saving.exportContent;
    return <></>;
  };

  return {
    TestComponent,
    smartSave: () => act(() => currentSmartSave()),
    forceSave: () => act(() => currentForceSave()),
    exportContent: () => currentExportContent(),
    setSavingProcessData: (savingProcessData: SavingProcessData) =>
      act(() => currentSetSavingProcessData(savingProcessData)),
    setUnlayerEditorObject: (
      unlayerEditorObject: UnlayerEditorObject | undefined,
    ) => act(() => currentSetUnlayerEditorObject(unlayerEditorObject)),
    dispatch,
    onSave,
  };
};

describe(useSaving.name, () => {
  describe("exportContent", () => {
    it("should return undefined when unlayer object is not ready", async () => {
      // Arrange
      const { TestComponent, exportContent } = createTestContext();
      render(<TestComponent />);

      // Act
      const result = await exportContent();

      // Assert
      expect(result).toBeUndefined();
    });

    it("should return data generated by unlayer object for unlayer designs", async () => {
      // Arrange
      const { TestComponent, setUnlayerEditorObject, exportContent } =
        createTestContext();

      const exportedDesign = "design" as any;
      const exportedHtml = "html";
      const exportedImageUrl = "url";

      render(<TestComponent />);
      const { unlayerEditorObject } = createUnlayerObjectDouble({
        exportedDesign,
        exportedHtml,
        exportedImageUrl,
      });
      setUnlayerEditorObject(unlayerEditorObject);

      // Act
      const result = await exportContent();

      // Assert
      expect(result).toEqual({
        htmlContent: exportedHtml,
        previewImage: exportedImageUrl,
        design: exportedDesign,
        type: "unlayer",
      });
    });

    it("should return data generated by unlayer object for legacy designs", async () => {
      // Arrange
      const { TestComponent, setUnlayerEditorObject, exportContent } =
        createTestContext();

      const exportedHtml = "html";
      const exportedImageUrl = "url";

      render(<TestComponent />);
      const { unlayerEditorObject } = createUnlayerObjectDouble({
        exportedHtml,
        exportedImageUrl,
      });
      setUnlayerEditorObject(unlayerEditorObject);

      // Act
      const result = await exportContent();

      // Assert
      expect(result).toEqual({
        htmlContent: exportedHtml,
        previewImage: exportedImageUrl,
        type: "html",
      });
    });
  });

  describe.each([
    { commandName: "forceSave" as const, expectedForce: true },
    { commandName: "smartSave" as const, expectedForce: false },
  ])("$commandName", ({ commandName, expectedForce }) => {
    it("should dispatch the action when unlayer object is defined", () => {
      // Arrange
      const {
        TestComponent,
        setUnlayerEditorObject,
        dispatch,
        forceSave,
        smartSave,
      } = createTestContext();
      const command = { forceSave, smartSave }[commandName];

      render(<TestComponent />);
      const { unlayerEditorObject } = createUnlayerObjectDouble();
      setUnlayerEditorObject(unlayerEditorObject);

      // Act
      command();

      // Assert
      expect(dispatch).toBeCalledWith({
        type: "save-requested",
        force: expectedForce,
      });
    });

    it("should dispatch the action even when unlayer object is not defined", () => {
      // Arrange
      const { TestComponent, dispatch, forceSave, smartSave } =
        createTestContext();
      const command = { forceSave, smartSave }[commandName];

      render(<TestComponent />);

      // Act
      command();

      // Asserts
      expect(dispatch).toBeCalledWith({
        type: "save-requested",
        force: expectedForce,
      });
    });
  });

  describe("Effect for preparing-content step", () => {
    it("should dispatch content-prepared-to-save with right data after prepare", async () => {
      // Arrange
      const {
        TestComponent,
        setUnlayerEditorObject,
        setSavingProcessData,
        dispatch,
      } = createTestContext();

      const exportedDesign = "design" as any;
      const exportedHtml = "html";
      const exportedImageUrl = "url";
      const savingUpdateCounter = 10;

      render(<TestComponent />);
      const { unlayerEditorObject } = createUnlayerObjectDouble({
        exportedDesign,
        exportedHtml,
        exportedImageUrl,
      });
      setUnlayerEditorObject(unlayerEditorObject);

      // Act
      setSavingProcessData({
        step: "preparing-content",
        savingUpdateCounter,
      });

      // Assert
      await waitFor(() => {
        expect(dispatch).toBeCalledWith({
          type: "content-prepared-to-save",
          content: {
            htmlContent: exportedHtml,
            previewImage: exportedImageUrl,
            design: exportedDesign,
            type: "unlayer",
          },
          savingUpdateCounter,
        });
      });
    });

    it("should dispatch save-error-happened on error exporting html", async () => {
      // Arrange
      const {
        TestComponent,
        setUnlayerEditorObject,
        setSavingProcessData,
        dispatch,
      } = createTestContext();

      const exportedDesign = "design" as any;
      const exportedHtml = "html";
      const exportedImageUrl = "url";
      const savingUpdateCounter = 10;
      const error = "error";

      render(<TestComponent />);
      const { unlayerEditorObject, mocks } = createUnlayerObjectDouble({
        exportedDesign,
        exportedHtml,
        exportedImageUrl,
      });
      setUnlayerEditorObject(unlayerEditorObject);
      mocks.exportHtmlAsync.mockImplementation(() => Promise.reject(error));

      // Act
      setSavingProcessData({
        step: "preparing-content",
        savingUpdateCounter,
      });

      // Assert
      await waitFor(() => {
        expect(dispatch).toBeCalledWith({
          type: "save-error-happened",
          step: "preparing-content",
          savingUpdateCounter,
          error,
        });
      });
    });

    // TODO: Fix this test
    // it("should dispatch save-error-happened on error exporting image", async () => {
    //   // Arrange
    //   const {
    //     TestComponent,
    //     setUnlayerEditorObject,
    //     setSavingProcessData,
    //     dispatch,
    //   } = createTestContext();

    //   const exportedDesign = "design" as any as Design;
    //   const exportedHtml = "html";
    //   const exportedImageUrl = "url";
    //   const savingUpdateCounter = 10;
    //   const error = "error";

    //   render(<TestComponent />);
    //   const { unlayerEditorObject, mocks } = createUnlayerObjectDouble({
    //     exportedDesign,
    //     exportedHtml,
    //     exportedImageUrl,
    //   });
    //   setUnlayerEditorObject(unlayerEditorObject);
    //   mocks.exportImageAsync.mockImplementation(() => Promise.reject(error));

    //   // Act
    //   setSavingProcessData({
    //     step: "preparing-content",
    //     savingUpdateCounter,
    //   });

    //   // Assert
    //   await waitFor(() => {
    //     expect(dispatch).toBeCalledWith({
    //       type: "save-error-happened",
    //       step: "preparing-content",
    //       savingUpdateCounter,
    //       error,
    //     });
    //   });
    // });
  });

  describe("Effect for content-saved step", () => {
    it("should save and then dispatch content-saved", async () => {
      // Arrange
      const contentToSave = { contentToSave: true } as any as Content;
      const savingUpdateCounter = 10;
      const { TestComponent, setSavingProcessData, dispatch, onSave } =
        createTestContext();

      let resolveOnSave: (value?: unknown) => void = noop;
      onSave.mockImplementation(
        () => new Promise((resolve) => (resolveOnSave = resolve)),
      );

      render(<TestComponent />);

      // Act
      setSavingProcessData({
        step: "posting-content",
        content: contentToSave,
        savingUpdateCounter,
      });

      // Assert
      expect(onSave).toBeCalledWith(contentToSave);
      expect(dispatch).not.toBeCalled();

      // Act
      resolveOnSave();

      // Assert
      await waitFor(() => {
        expect(dispatch).toBeCalledWith({
          type: "content-saved",
          savingUpdateCounter,
        });
      });
    });

    it("should dispatch save-error-happened when save fails", async () => {
      // Arrange
      const contentToSave = { contentToSave: true } as any as Content;
      const savingUpdateCounter = 10;
      const { TestComponent, setSavingProcessData, dispatch, onSave } =
        createTestContext();
      const error = "error";

      onSave.mockImplementation(() => Promise.reject(error));

      render(<TestComponent />);

      // Act
      setSavingProcessData({
        step: "posting-content",
        content: contentToSave,
        savingUpdateCounter,
      });

      // Assert
      await waitFor(() => {
        expect(dispatch).toBeCalledWith({
          type: "save-error-happened",
          step: "posting-content",
          savingUpdateCounter,
          error,
        });
      });
    });
  });
});
