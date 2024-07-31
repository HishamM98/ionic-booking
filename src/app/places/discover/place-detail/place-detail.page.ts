import { PlacesService } from './../../places.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Place } from '../../places.model';
import { Subscription, switchMap, take } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable: boolean = false;
  private placesSub: Subscription;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private place$: PlacesService,
    private modalController: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private booking$: BookingService,
    private loadingCtrl: LoadingController,
    private auth$: AuthService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    let placeId: string;
    this.activatedRoute.paramMap.subscribe(
      (params) => (placeId = params.get('placeId'))
    );

    let fetchedUserId: string;

    this.auth$.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('Found no user!');
        }
        fetchedUserId = userId;
        return this.place$.getPlace(placeId);
      })
    ).subscribe({
      next: (place) => {
        this.place = place;
        this.isBookable = place.userId !== fetchedUserId;
      },
      error: (error) => {
        this.alertCtrl.create({
          header: 'An error occurred!',
          message: 'Could not find place.',
          buttons: [{
            text: 'Okay',
            handler: () => {
              this.router.navigateByUrl('/places/tabs/discover');
            }
          }]
        })
          .then(alertEl => alertEl.present());
      }
    });

  }

  onBookPlace() {
    // this.router.navigate(['/places/tabs/discover']);
    // this.navCtrl.navigateBack('/places/tabs/discover');

    this.actionSheetCtrl
      .create({
        header: 'Choose an Action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingModal('Select');
            },
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookingModal('Random');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionSheetEl) => actionSheetEl.present());
  }

  openBookingModal(mode: 'Select' | 'Random') {
    console.log(mode);
    this.modalController
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resultData) => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === 'confirm') {

          const data = resultData.data.bookingData;
          this.loadingCtrl.create({
            message: 'Creating Booking...',
            spinner: 'bubbles'
          })
            .then(loadingEl => {
              loadingEl.present();
              this.booking$.addBooking(this.place.id, this.place.title, this.place.imageUrl, data.firstName, data.lastName, data.guestNumber, data.startDate, data.endDate).subscribe({
                next: () => {
                  this.router.navigateByUrl('/bookings');
                  loadingEl.dismiss();
                },
                error: (error) => {
                  loadingEl.dismiss();
                  this.alertCtrl.create({
                    header: "Error creating booking!",
                    message: 'Could not create booking...please try again',
                    buttons: [{
                      text: 'Okay',
                      handler: () => {
                        this.router.navigateByUrl(`/places/tabs/discover/${this.place.id}`);
                      }
                    }]
                  })
                    .then(alertEl => {
                      alertEl.present;
                    });
                }
              });
            });
        }

      });
  }

  onShowFullMap() {
    this.modalController.create({
      component: MapModalComponent,
      componentProps: {
        center: { lat: this.place.location.lat, lng: this.place.location.lng },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    })
      .then(modalEl => {
        modalEl.present();
      });
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
