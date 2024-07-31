import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../places.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  loadedOffers: Place[];
  private placesSub: Subscription;

  constructor(private places$: PlacesService, private router: Router, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.placesSub = this.places$.places.subscribe((places) => {
      this.loadedOffers = places;
    });

  }

  ionViewWillEnter() {
    if (this.loadedOffers.length <= 1) {
      this.loadingCtrl.create({
        message: "Loading offers...",
        spinner: 'bubbles'
      })
        .then((loadingEl => {
          loadingEl.present();
          this.places$.fetchPlaces().subscribe(() => {
            loadingEl.dismiss();
          });
        }));
    }

  }

  onEdit(id: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigateByUrl('/places/tabs/offers/edit/' + id);
    console.log(id);
  }

  onDelete(id: string, slidingItem: IonItemSliding) {
    this.loadingCtrl.create({
      message: "Deleting offer...",
      spinner: 'bubbles'
    })
      .then((loadingEl => {
        loadingEl.present();
        this.places$.deletePlace(id).subscribe({
          next: () => {
            loadingEl.dismiss();
          },
          error: err => {
            loadingEl.dismiss();
            console.log(`error deleting offer: ${err.message}`);
          }
        });
      }));
    slidingItem.close();
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
