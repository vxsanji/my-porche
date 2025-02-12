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
    email: new FormControl('akagami.ef@gmail.com', [Validators.required]),
    password: new FormControl('#SlQYbG3', [Validators.required])
  })

  constructor(
    private authService: AuthService,
    private router : Router
  ){}

  onLogin = () => {
    this.authService.login(this.account.value as {email:string, password:string})
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

