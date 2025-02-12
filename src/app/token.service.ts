import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  getUserFromStorage(): string {
    return window.localStorage["e8user"];
  }

  saveUserToStorage(user: string): void {
    window.localStorage["e8user"] = user;
  }

  destroyUserToStorage(): void {
    window.localStorage.removeItem("e8user");
  }
}
