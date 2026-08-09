import { buildings, type VisualFit } from "./game-data";

export type BuildingImagePresentation = {
  fit: VisualFit;
  position: string;
};

const buildingImagePresentations = new Map(
  buildings.map((building) => [
    building.image,
    {
      fit: building.imageFit ?? "cover",
      position: building.imagePosition ?? "center",
    },
  ]),
);

export const buildingImagePresentation = (image: string): BuildingImagePresentation | undefined =>
  buildingImagePresentations.get(image);

export const resolvedImagePresentation = (
  image: string,
  compact = false,
): BuildingImagePresentation =>
  buildingImagePresentation(image) ?? {
    fit: compact || image.startsWith("/burrow-assets/hot-sauces/") ? "contain" : "cover",
    position: "center",
  };
