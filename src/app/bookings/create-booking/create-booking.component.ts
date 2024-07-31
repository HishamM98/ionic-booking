import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/places.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'Select' | 'Random';
  @ViewChild('f') form: NgForm;

  startDate: string;
  endDate: string;

  endMin: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    // console.log(this.selectedPlace, this.selectedPlace.availableFrom.toISOString().split('T',1));
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);
    if (this.selectedMode === 'Random') {
      this.startDate = new Date(availableFrom.getTime() + Math.random() * (availableTo.getTime() - 7 * 24 * 60 * 60 * 1000 - availableFrom.getTime())).toISOString();
      this.endDate = new Date(new Date(this.startDate).getTime() + Math.random() * (new Date(this.startDate).getTime() + 6 * 24 * 60 * 60 * 1000 - new Date(this.startDate).getTime())).toISOString();
    }
  }

  onBookPlace() {
    if (!this.form.valid) {
      return;
    }
    this.modalController.dismiss(
      {
        bookingData: {
          firstName: this.form.value['first-name'],
          lastName: this.form.value['last-name'],
          guestNumber: +this.form.value['guest-number'],
          startDate: new Date(this.form.value['date-from']),
          endDate: new Date(this.form.value['date-to'])
        }
      },
      'confirm'
    );
    // console.log("Booked!");

  }

  onCancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  setEndMin(event) {
    let end = new Date(event.detail.value);
    end.setDate(end.getDate() + 1);
    this.endMin = end.toISOString();
  }
}
