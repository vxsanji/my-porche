import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  account = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  constructor(
    private authService: AuthService,
    private router : Router
  ){}

  onLogin = () => {
    this.authService.login(this.account.value as {username:string, password:string})
    .subscribe({
      next: res => {
        this.router.navigate(['/trade']);
      },
      error: err => {
        alert(err);
      }
    })
  }
}

