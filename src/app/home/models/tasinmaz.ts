export class Tasinmaz {
    id: number;
    neigborhoodId: number;
    userId: number;
    
    island: string;
    parcel: string;
    quality: string;
    coordinateInformation: string;

    constructor(neighborhoodId: number, userId: number, island: string, parcel: string, quality: string, coordinateInformation: string) {
        this.neigborhoodId = neighborhoodId;
        this.userId = userId;
        this.island = island;
        this.parcel = parcel;
        this.quality = quality;
        this.coordinateInformation = coordinateInformation;
    }
}
