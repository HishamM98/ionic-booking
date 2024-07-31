export class Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  userId: string;
  availableFrom: Date;
  availableTo: Date;
  constructor(id: string, title: string, description: string, price: number, availableFrom: Date, availableTo: Date, userId: string,) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.userId = userId;
    this.availableFrom = availableFrom;
    this.availableTo = availableTo;
  }
}
