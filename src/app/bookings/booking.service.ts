import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject, delay, map, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

interface bookingData {
  placeId: string;
  userId: string;
  placeTitle: string;
  placeImage: string;
  firstName: string;
  lastName: string;
  guestNumber: number;
  bookedFrom: Date;
  bookedTo: Date;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  constructor(private auth$: AuthService, private http: HttpClient) { }

  addBooking(placeId: string, placeTitle: string, placeImage: string, firstName: string, lastName: string, guestNumber: number, dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    let newBooking: Booking;
    let fetchedToken: string;

    return this.auth$.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.auth$.userId;
      }),
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        newBooking = {
          id: Math.random().toString(),
          placeId: placeId,
          userId: userId,
          placeTitle: placeTitle,
          placeImage: placeImage,
          firstName: firstName,
          lastName: lastName,
          guestNumber: guestNumber,
          bookedFrom: dateFrom,
          bookedTo: dateTo
        };

        return this.http.post<{ name: string; }>(`https://ionic-angular-course-ccc29-default-rtdb.europe-west1.firebasedatabase.app/bookings.json?auth=${fetchedToken}`, { ...newBooking, id: null });
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1),
      tap((bookings) => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );

  }

  cancelBooking(bookingId: string) {

    return this.auth$.token.pipe(
      take(1),
      switchMap(token => {

        return this.http.delete(`https://ionic-angular-course-ccc29-default-rtdb.europe-west1.firebasedatabase.app/bookings/${bookingId}.json?auth=${token}`);
      }),
      switchMap(resData => {
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        this._bookings.next(bookings.filter(booking => booking.id !== bookingId));
      })
    );

  }

  fetchBookings() {
    let fetchedToken: string;
    return this.auth$.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.auth$.userId;
      }),
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        return this.http.get<{ [key: string]: bookingData; }>(`https://ionic-angular-course-ccc29-default-rtdb.europe-west1.firebasedatabase.app/bookings.json?auth=${fetchedToken}&orderBy="userId"&equalTo="${userId}"`);
      }),
      map(resData => {
        const bookings: Booking[] = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            let booking: Booking = {
              id: key,
              placeId: resData[key].placeId,
              userId: resData[key].userId,
              placeTitle: resData[key].placeTitle,
              placeImage: resData[key].placeImage,
              firstName: resData[key].firstName,
              lastName: resData[key].lastName,
              guestNumber: resData[key].guestNumber,
              bookedFrom: new Date(resData[key].bookedFrom),
              bookedTo: new Date(resData[key].bookedTo)
            };
            bookings.push(booking);
          }
        }
        return bookings;
      }),
      tap(bookings => {
        // console.log(places);
        this._bookings.next(bookings);
      })
    );
  }
}
