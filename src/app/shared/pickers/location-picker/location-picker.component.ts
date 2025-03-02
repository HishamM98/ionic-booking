import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment as env } from 'src/environments/environment';
import { map, of, switchMap } from 'rxjs';
import { Coordinates, PlaceLocation } from 'src/app/places/location.model';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';


@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading: boolean = false;

  constructor(private modalCtrl: ModalController, private http: HttpClient, private actionSheetCtrl: ActionSheetController, private alertCtrl: AlertController) { }

  ngOnInit() { }

  onPickLocation() {
    this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [{
        text: 'Auto-locate',
        handler: () => { this.locateUser(); }
      },
      {
        text: 'Pick on Map',
        handler: () => { this.openMap(); }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }

    this.isLoading = true;
    Geolocation.getCurrentPosition()
      .then((geoPosition) => {
        const coordinates: Coordinates = { lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude };
        this.createPlace(coordinates.lat, coordinates.lng);
        this.isLoading = false;
      })
      .catch((error) => {
        this.showErrorAlert(error.message);
      });
  }

  private showErrorAlert(message?) {
    this.alertCtrl.create({
      header: message || 'Could not fetch location',
      message: 'Please use the map to pick a location instead',
      buttons: [{
        text: 'Okay'
      }]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  private openMap() {
    this.modalCtrl.create({
      component: MapModalComponent,
    })
      .then(modalEl => {
        modalEl.onDidDismiss().then(modalData => {
          // console.log(modalData.data);
          if (!modalData.data) {
            return;
          }

          const coordinates: Coordinates = {
            lat: modalData.data.lat,
            lng: modalData.data.lng
          };

          this.createPlace(coordinates.lat, coordinates.lng);

        });
        modalEl.present();

      });
  }

  private createPlace(lat: number, lng: number) {
    this.isLoading = true;

    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };


    this.getAddress(lat, lng).pipe(
      switchMap(address => {
        pickedLocation.address = address;
        return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
      })
    ).subscribe(staticMapImageUrl => {
      pickedLocation.staticMapImageUrl = staticMapImageUrl;
      this.selectedLocationImage = staticMapImageUrl;
      this.isLoading = false;
      this.locationPick.emit(pickedLocation);
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${env.googleMapsAPIKey}`)
      .pipe(
        map((geoData: any) => {
          // console.log(geoData);
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${env.googleMapsAPIKey}`;
  }
}
