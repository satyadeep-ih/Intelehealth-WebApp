import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "src/app/services/session.service";
declare var saveToStorage: any;

@Component({
  selector: "app-login-page",
  templateUrl: "./login-page-new.component.html",
  styleUrls: ["./login-page.component.scss"],
})
export class LoginPageComponent implements OnInit {
  @Output() onSucess = new EventEmitter<boolean>();
  // images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);
  loginForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
    recaptcha: new FormControl("", [Validators.required]),
  });
  showError: boolean = false;
  showPassword: boolean = false;
  showCaptcha: boolean = true;
  siteKey: string = "6Lde9KIhAAAAALJTYaWvatcZX70x0tgtEKh5Wf8k";
  constructor(
    private sessionService: SessionService,
    private router: Router,
    private snackbar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.showCaptcha = true;
    const isLoggedIn: boolean = this.authService.isLoggedIn();
    if (isLoggedIn) {
      this.router.navigateByUrl("/home");
    }
  }

  onSubmit() {
    const value = this.loginForm.value;
    const string = `${value.username}:${value.password}`;
    const base64 = btoa(string);
    this.sessionService.loginSession(base64).subscribe((response) => {
      if (response.authenticated === true) {
        this.onSucess.emit(true);
        /*this.router.navigate(["/home"]);
        this.authService.sendToken(response.sessionId);
        saveToStorage("user", response.user);
        this.snackbar.open(`Welcome ${response.user.person.display}`, null, {
          duration: 4000,
        });*/
      } else {
        this.showCaptcha = false;
        this.showError = true;
        /* this.snackbar.open("Username & Password doesn't match", null, {
          duration: 4000,
        });*/
      }
    });
  }
  showHidePassword() {
    this.showPassword = !this.showPassword;
  }
}
