import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  getUserFromStorage(): string {
    return window.localStorage["porche"];
  }

  getToken(): string {
    let user = JSON.parse(this.getUserFromStorage() || '{}')
    return 'Bearer '+user.token
  }

  saveUserToStorage(user: string): void {
    window.localStorage["porche"] = user;
  }

  destroyUserToStorage(): void {
    window.localStorage.removeItem("porche");
  }
}
