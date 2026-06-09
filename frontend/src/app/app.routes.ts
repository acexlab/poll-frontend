import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(c => c.RegisterComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then(c => c.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'polls', loadComponent: () => import('./features/admin/poll-list.component').then(c => c.PollListComponent) },
      { path: 'create-poll', loadComponent: () => import('./features/admin/create-poll.component').then(c => c.CreatePollComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users.component').then(c => c.UsersComponent) }
    ]
  },
  {
    path: 'user',
    canActivate: [authGuard, userGuard],
    loadComponent: () => import('./features/user/user-layout.component').then(c => c.UserLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'polls' },
      { path: 'polls', loadComponent: () => import('./features/user/active-polls.component').then(c => c.ActivePollsComponent) },
      { path: 'my-votes', loadComponent: () => import('./features/user/my-votes.component').then(c => c.MyVotesComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
