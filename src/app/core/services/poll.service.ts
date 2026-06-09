import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Poll, CreatePoll, PaginatedResult } from '../models/poll.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5273/api/polls';
  private adminUrl = 'http://localhost:5273/api/admin';

  getPolls(page: number = 1, pageSize: number = 10): Observable<PaginatedResult<Poll>> {
    return this.http.get<PaginatedResult<Poll>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  getActivePolls(): Observable<Poll[]> {
    return this.http.get<Poll[]>(`${this.apiUrl}/active`);
  }

  getPollById(id: number): Observable<Poll> {
    return this.http.get<Poll>(`${this.apiUrl}/${id}`);
  }

  createPoll(poll: CreatePoll): Observable<Poll> {
    return this.http.post<Poll>(this.apiUrl, poll);
  }

  createFifaPoll(): Observable<Poll> {
    return this.http.post<Poll>(`${this.apiUrl}/fifa`, {});
  }

  enablePoll(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/enable`, {});
  }

  disablePoll(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/disable`, {});
  }

  // Admin Specific
  getUsers(page: number = 1, pageSize: number = 10): Observable<PaginatedResult<User>> {
    return this.http.get<PaginatedResult<User>>(`${this.adminUrl}/users?page=${page}&pageSize=${pageSize}`);
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/analytics`);
  }

  deletePoll(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
