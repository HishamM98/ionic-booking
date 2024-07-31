import { Component, OnInit } from '@angular/core';
import { AuthResponseData, AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLogin: boolean = true;

  constructor(
    private auth$: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() { }

  authenticate(email: string, password: string) {
    this.loadingCtrl
      .create({
        keyboardClose: true,
        message: 'Logging in...',
        spinner: 'bubbles',
        translucent: true,
        showBackdrop: true,
      })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;

        if (this.isLogin) {
          authObs = this.auth$.login(email, password);
        } else {
          authObs = this.auth$.signUp(email, password);
        }

        authObs.subscribe({
          next: (res) => {
            // console.log(res);
            loadingEl.dismiss();
            this.router.navigate(['']);
          },
          error: (errRes) => {
            loadingEl.dismiss();
            this.showAlert(`${this.isLogin ? 'Failed to Login!' : 'Failed to signup!'} - ${(errRes.error.error.message).toLowerCase()}`);
          }
        });

      });
  }

  onSubmit(f: NgForm) {
    // console.log(f.value);
    if (!f.valid) {
      return;
    }

    const email = f.value.email;
    const password = f.value.password;

    this.authenticate(email, password);
    f.reset();
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  private showAlert(message?: string) {
    this.alertCtrl.create({
      header: this.isLogin ? "Login Error!" : "Signup Error!",
      message: message || "Operation Failed, please try again",
      buttons: ["OK"]
    })
      .then(alertEl => {
        alertEl.present();
      });
  }
}
