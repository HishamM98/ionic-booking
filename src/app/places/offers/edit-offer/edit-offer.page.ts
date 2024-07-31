import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, map } from 'rxjs';
import { AlertController, LoadingController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  form: FormGroup;
  placeId: string;
  place: Place;
  private placesSub: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private places$: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.placeId = params.get('offerId');
    });

    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)],
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)],
      }),
    });

    this.placesSub = this.places$.getPlace(this.placeId).subscribe({
      next: (place) => {
        this.place = place;
        this.form.patchValue(this.place);
      },
      error: (error) => {
        this.alertCtrl.create({
          header: 'An error occurred!',
          message: 'Place could not be fetched. Please try again',
          buttons: [{
            text: 'Okay',
            handler: () => {
              this.router.navigateByUrl('/places/tabs/offers');
            }
          }]
        })
          .then(alertEl => {
            alertEl.present();
          })
      }
    });

  }

  onEditOffer() {
    if (this.form.invalid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating offer...',
      spinner: 'bubbles'
    })
      .then((loadingEl) => {
        loadingEl.present();
        this.places$.updatePlace(this.placeId, this.form.value.title, this.form.value.description).subscribe(() => {
          loadingEl.dismiss();
          console.log('offer updated');
          this.form.reset();
          this.router.navigateByUrl('/places/tabs/offers');
        })
      });

  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
function Next(value: Place): void {
  throw new Error('Function not implemented.');
}

