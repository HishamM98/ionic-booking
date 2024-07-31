import { PlaceLocation } from "./location.model";

export class Place {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  availableFrom: Date;
  availableTo: Date;
  userId: string;
  location: PlaceLocation;
  constructor(
    id: string,
    title: string,
    description: string,
    imageUrl: string,
    price: number,
    availableFrom: Date,
    availableTo: Date,
    userId: string,
    location: PlaceLocation
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
    this.price = price;
    this.availableFrom = availableFrom;
    this.availableTo = availableTo;
    this.userId = userId;
    this.location = location;
  }
}
