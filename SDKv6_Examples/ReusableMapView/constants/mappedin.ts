import type { TShow3DMapOptions } from "@mappedin/mappedin-js";

export const MAPPEDIN_OPTIONS = {
  key: "5eab30aa91b055001a68e996",
  secret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
  mapId: "mappedin-demo-mall",
} as const;

export const MAP_VIEW_OPTIONS: TShow3DMapOptions = {
  multiFloorView: {
    spacesOpenToBelowEnabled: true,
    footprintOpacity: 1,
  },
};
