import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
import { SessionService } from "src/app/services/session.service";//
import { AuthService } from "src/app/services/auth.service";
declare var saveToStorage: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  ForgotPasswordForm = new FormGroup({
    username: new FormControl("", [Validators.required]),
  });
  usernameExists:boolean = false;
  constructor(
    private service: VisitService,
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    localStorage.setItem("selectedLanguage", "en");
    this.service.clearVisits();
  }

  onSubmit() {
    if (!this.ForgotPasswordForm.invalid) {
      const value = this.ForgotPasswordForm.value;
      const string = `${value.username}`;
      console.log(value)
      const base64 = btoa(string);
      saveToStorage("session", base64);
      this.sessionService.loginSession(base64).subscribe((response) => {
        if (response.authenticated === true) {
          this.router.navigate(["/login"]);
        } else {
          this.usernameExists = true;
        }
        });
    }
  }
}
