import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../places.model';
import { LoadingController, MenuController, SegmentChangeEventDetail } from '@ionic/angular';
import { Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  relevantPlaces: Place[];
  private placesSub: Subscription;

  constructor(
    private places$: PlacesService,
    private menuController: MenuController,
    private auth$: AuthService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.placesSub = this.places$.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
    });
  }

  ionViewWillEnter() {
    if (this.loadedPlaces.length <= 0) {
      this.loadingCtrl.create({
        message: "Loading offers...",
        spinner: 'bubbles'
      })
        .then((loadingEl => {
          loadingEl.present();
          this.places$.fetchPlaces().subscribe({
            next: () => {
              loadingEl.dismiss();
            },
            error: err => {
              console.log(err.message);
              loadingEl.dismiss();
            }
          });
        }));
    }

  }

  onOpenMenu() {
    this.menuController.open();
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.auth$.userId.pipe(take(1)).subscribe(userId => {
      let uid = userId;
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
      }
      else {
        this.relevantPlaces = this.loadedPlaces.filter(pl => pl.userId !== uid);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
