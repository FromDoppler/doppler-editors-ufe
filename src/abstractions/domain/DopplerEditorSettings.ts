import { SortingProductsCriteria } from "../../components/product-gallery/HeaderSortProductsDropdown";

export type DopplerEditorSettings = Readonly<{
  abandonedCartCampaign: boolean;
  visitedProductsCampaign: boolean;
  confirmationOrderCampaign: boolean;
  pendingOrderCampaign: boolean;
  bestSellingEnabled: boolean;
  newProductsEnabled: boolean;
  crossSellingEnabled: boolean;
  rssCampaign: boolean;
  rssShowPreview: boolean;
  stores: Readonly<DopplerEditorStore[]>;
}>;

export type DopplerEditorStore = Readonly<{
  name: string;
  promotionCodeEnabled: boolean;
  promotionCodeDynamicEnabled: boolean;
  productsEnabled: boolean;
  sortingProductsCriteria: Readonly<SortingProductsCriteria[]>;
}>;
