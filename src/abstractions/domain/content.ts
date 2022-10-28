import { Design } from "react-email-editor";

export type Content =
  | {
      htmlContent: string;
      previewImage: string;
      campaignName: string;
      type: "html";
    }
  | {
      htmlContent: string;
      design: Design;
      previewImage: string;
      campaignName: string;
      type: "unlayer";
    };
