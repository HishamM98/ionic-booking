import { AuthService } from 'src/app/auth/auth.service';
import { Offer } from './offers.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OffersService {
  private _offers = new BehaviorSubject<Offer[]>([
    new Offer('o1', 'Offer 1', 'nice offer', 200, new Date('2023-03-03'),
      new Date('2023-11-31'), 'abc',),
    new Offer('o2', 'Offer 2', 'awesome offer', 150, new Date('2023-04-04'),
      new Date('2023-10-31'), 'abc',),
    new Offer('o3', 'Offer 3', 'common offer', 300, new Date('2023-05-05'),
      new Date('2023-09-31'), 'abc',),
  ]);

  get offers() {
    return this._offers.asObservable();
  }
  constructor(private auth$: AuthService) { }

  getOffer(id: string) {
    return this.offers.pipe(
      take(1),
      map(offers => {
        return { ...offers.find(p => p.id === id) };
      })
    );
  }

  addOffer(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let userId;
    this.auth$.userId.subscribe({
      next: id => userId = id,
      error: (err: any) => console.log(err)
    });
    const newOffer = new Offer(Math.random().toString(), title, description, price, dateFrom, dateTo, userId,);
    return this.offers.pipe(
      take(1),
      delay(1000),
      tap(offers => {
        this._offers.next(offers.concat(newOffer));
      })
    );
  }

  updateOffer(offerId: string, title: string, description: string) {
    return this.offers.pipe(
      take(1),
      delay(1000),
      tap(offers => {
        const updatedOfferIndex = offers.findIndex(off => off.id == offerId);
        const updatedOffers = [...offers];
        const old = updatedOffers[updatedOfferIndex];
        updatedOffers[updatedOfferIndex] = new Offer(old.id, title, description, old.price, old.availableFrom, old.availableTo, old.userId);
        this._offers.next(updatedOffers);
      })
    );
  }
}
