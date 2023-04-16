export interface WebsiteRecord {
    id: number;
    url: string;
    boundaryRegExp: string;
    periodicity: number;
    label: string;
    isActive: boolean;
    isBeingCrawled: boolean;
    tags: string[];
    crawledData: any;
    requestDoCrawl: boolean;
}