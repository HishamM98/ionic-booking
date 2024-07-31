import { Component, OnDestroy, OnInit } from '@angular/core';
import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { AlertController, IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  bookingSub: Subscription;

  constructor(private booking$: BookingService, private loadingCtrl: LoadingController, private alertCtrl: AlertController, private router: Router) { }

  ngOnInit() {
    this.bookingSub = this.booking$.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }

  ionViewWillEnter() {
    this.loadingCtrl.create({
      message: 'Fetching bookings...',
      spinner: 'bubbles'
    })
      .then(loadingEl => {
        loadingEl.present();
        this.booking$.fetchBookings().subscribe({
          next: () => {
            loadingEl.dismiss();
          },
          error: (error) => {
            loadingEl.dismiss();
            this.alertCtrl.create({
              header: 'Error fetching bookings',
              message: 'Fetching bookings failed...please try again',
              buttons: [{
                text: 'Okay',
                handler: () => {
                  this.router.navigateByUrl(`/places/tabs/discover`);
                }
              }]
            })
              .then(alertEl => {
                alertEl.present();
              })
          }
        });
      })
  }

  onCancelBooking(bookingId: string, slidingBooking: IonItemSliding) {
    this.loadingCtrl.create({
      message: 'Cancelling Booking...',
      spinner: 'bubbles'
    })
      .then(loadingEl => {
        loadingEl.present();
        this.booking$.cancelBooking(bookingId).subscribe(() => {
          loadingEl.dismiss();
          slidingBooking.close();
        });
      });

  }

  ngOnDestroy(): void {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }
}
