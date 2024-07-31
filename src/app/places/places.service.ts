import { Injectable } from '@angular/core';
import { Place } from './places.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, delay, map, of, switchMap, take, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlaceLocation } from './location.model';
import { environment as env } from 'src/environments/environment';

// [
//   new Place(
//     'p1',
//     'Manhattan Mansion',
//     'In the heart of New York city.',
//     'https://www.bhg.com/thmb/3Vf9GXp3T-adDlU6tKpTbb-AEyE=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/white-modern-house-curved-patio-archway-c0a4a3b3-aa51b24d14d0464ea15d36e05aa85ac9.jpg',
//     149.99,
//     new Date('2023-01-01'),
//     new Date('2023-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p2',
//     "L'Amour Toujours",
//     'A romantic place in Paris!',
//     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Sutton_House_Paris_Idaho.jpeg/1200px-Sutton_House_Paris_Idaho.jpeg?20200624214131',
//     189.99,
//     new Date('2023-01-01'),
//     new Date('2023-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'The Foggy Palace',
//     'Not your average city trip!',
//     'https://upload.wikimedia.org/wikipedia/commons/a/ad/Foggy_Parliament_-_geograph.org.uk_-_3859656.jpg?20220928201428',
//     99.99,
//     new Date('2023-01-01'),
//     new Date('2023-12-31'),
//     'xyz'
//   ),
// ]


interface placeData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(private auth$: AuthService, private http: HttpClient) { }

  get places() {
    return this._places.asObservable();
  }

  getPlace(id: string) {
    return this.auth$.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<placeData>(`https://ionic-angular-course-ccc29-default-rtdb.europe-west1.firebasedatabase.app/offered-places/${id}.json?auth=${token}`);
      }),
      map(placeData => {
        return new Place(id, placeData.title, placeData.description, placeData.imageUrl, placeData.price, new Date(placeData.availableFrom), new Date(placeData.availableTo), placeData.userId, placeData.location);
      })
    );
  }

  fetchPlaces() {
    return this.auth$.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: placeData; }>(`https://ionic-angular-course-ccc29-default-rtdb.europe-west1.firebasedatabase.app/offered-places.json?auth=${token}`);
      }),
      map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(new Place(key, resData[key].title, resData[key].description, resData[key].imageUrl, resData[key].price, new Date(resData[key].availableFrom), new Date(resData[key].availableTo), resData[key].userId, resData[key].location));
          }
        }
        return places;
      }),
      tap(places => {
        // console.log(places);
        this._places.next(places);
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.auth$.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ imageUrl: string, imagePath: string; }>(env.FirebaseFunctionUrl, uploadData, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
      })
    );


  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation, imageUrl: string) {
    let generatedId: string;
    let newPlace: Place;
    let fetchedUserId: string;

    return this.auth$.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.auth$.token;
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user id found!');
        }

        newPlace = new Place(Math.random().toString(), title, description, imageUrl, price, dateFrom, dateTo, fetchedUserId, location);

        return this.http.post<{ name: string; }>(`https://ionic-angular-course-ccc29-default-rtdb.europe-west1.firebasedatabase.app/offered-places.json?auth=${token}`, { ...newPlace, id: null });
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );

  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken: string;

    return this.auth$.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        }
        else {
          return of(places);
        }

      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(place => place.id == placeId);
        updatedPlaces = [...places];
        const old = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(old.id, title, description, old.imageUrl, old.price, old.availableFrom, old.availableTo, old.userId, old.location);

        return this.http.put(`https://ionic-angular-course-ccc29-default-rtdb.europe-west1.firebasedatabase.app/offered-places/${placeId}.json?auth=${fetchedToken}`, { ...updatedPlaces[updatedPlaceIndex], id: null });
      }),
      tap(() => {
        // console.log(resData);
        this._places.next(updatedPlaces);
      })
    );

  }

  deletePlace(placeId: string) {

    return this.auth$.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(`https://ionic-angular-course-ccc29-default-rtdb.europe-west1.firebasedatabase.app/offered-places/${placeId}.json?auth=${token}`);
      }),
      switchMap(resData => {
        return this.places;
      }),
      take(1),
      tap(places => {
        this._places.next(places.filter(place => place.id !== placeId));
      })
    );

  }

}
