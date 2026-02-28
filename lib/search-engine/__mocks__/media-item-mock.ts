import { RawMediaItem } from "../DataProcessor";
import { MediaItem } from "../SearchEngine";

export const RAW_MEDIA_ITEM_MOCK_1: RawMediaItem = {
    suchtext: "A beautiful scenery [nature] [sunset]",
    bildnummer: "IMG_123",
    fotografen: "John Doe",
    datum: "15.08.2023",
    hoehe: "1080",
    breite: "1920"
};

export const RAW_MEDIA_ITEM_MOCK_2: RawMediaItem = {
    suchtext: "Sunset over the mountains [nature] [beautiful]",
    bildnummer: "IMG_1",
    fotografen: "Ansel Adams",
    datum: "05.10.1980",
    hoehe: "2000",
    breite: "3000"
};

export const RAW_MEDIA_ITEM_MOCK_3: RawMediaItem = {
    suchtext: "City skyline at night",
    bildnummer: "IMG_2",
    fotografen: "Jane Doe",
    datum: "12.12.2023",
    hoehe: "1080",
    breite: "1920"
};

export const RAW_MEDIA_ITEMS_MOCK_ARRAY: RawMediaItem[] = [
    RAW_MEDIA_ITEM_MOCK_2,
    RAW_MEDIA_ITEM_MOCK_3
];

export const MEDIA_ITEM_MOCK_1: MediaItem = {
    id: "1",
    bildnummer: "IMG_001",
    suchtext: "apple banana cherry",
    fotografen: "John Doe",
    datum: "2023-01-01",
    hoehe: "1080"
};

export const MEDIA_ITEM_MOCK_2: MediaItem = {
    id: "2",
    bildnummer: "IMG_002",
    suchtext: "banana orange",
    fotografen: "Jane Smith",
    datum: "2023-01-02",
    hoehe: "1080"
};

export const MEDIA_ITEM_MOCK_3: MediaItem = {
    id: "3",
    bildnummer: "IMG_003",
    suchtext: "apple pie recipe",
    fotografen: "John Doe",
    datum: "2023-01-03",
    hoehe: "1080"
};

export const MEDIA_ITEMS_MOCK_ARRAY: MediaItem[] = [
    MEDIA_ITEM_MOCK_1,
    MEDIA_ITEM_MOCK_2,
    MEDIA_ITEM_MOCK_3
];