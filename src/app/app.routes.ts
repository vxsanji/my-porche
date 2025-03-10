import { Router, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs';
import { AccountsComponent } from './accounts/accounts.component';
import { HistoricalComponent } from './historical/historical.component';

export const routes: Routes = [
    { path: '', redirectTo: 'trade', pathMatch: 'full' },
    { path: 'login', loadComponent: () => LoginComponent},
    { path: 'trade',
        loadComponent: () => HomeComponent,
        canActivate: [() => {
            const router = inject(Router)
            return inject(AuthService).isAuthenticated
                .pipe(map( isAuth => {
                    if(isAuth) return true
                    else {
                        alert('Please login first')
                        router.navigate(['/login']);
                        return false
                    }
                }))
        }]
    },
    { path: 'accounts',
        loadComponent: () => AccountsComponent,
        canActivate: [() => {
            const router = inject(Router)
            return inject(AuthService).isAuthenticated
                .pipe(map( isAuth => {
                    if(isAuth) return true
                    else {
                        alert('Please login first')
                        router.navigate(['/login']);
                        return false
                    }
                }))
        }]
    },
    { path: 'historical',
        loadComponent: () => HistoricalComponent,
        canActivate: [() => {
            const router = inject(Router)
            return inject(AuthService).isAuthenticated
                .pipe(map( isAuth => {
                    if(isAuth) return true
                    else {
                        alert('Please login first')
                        router.navigate(['/login']);
                        return false
                    }
                }))
        }]
    }

];