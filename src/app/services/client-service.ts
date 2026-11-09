import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8081/api/clients';
  private adminUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) { }

 public ouvrirCompte(formData: FormData): Observable<any> {
  return this.http.post(
    `${this.adminUrl}/account-requests`,
    formData
  );
}

 public login(email: string, password: string) {
   return this.http.post(`${location.protocol}//${location.hostname}:8081/auth/login`, { email, password });
 }

 public changePassword(clientId: string, newPassword: string) {
  return this.http.post<{ message: string }>(
    `${location.protocol}//${location.hostname}:8081/auth/change-password`,
    { clientId, newPassword }
  );
}


 public getAccountRequestByClientId(clientId: string) {
   return this.http.get(`${this.adminUrl}/account-requests/by-client/${clientId}`);
 }


  public getDemandes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  // Admin endpoints
  public getAccountRequests(): Observable<any> {
    return this.http.get(`${this.adminUrl}/account-requests`);
  }

  public approveRequest(id: string): Observable<any> {
    return this.http.post(`${this.adminUrl}/account-requests/${id}/approve`, {});
  }

  public rejectRequest(id: string): Observable<any> {
    return this.http.post(`${this.adminUrl}/account-requests/${id}/reject`, {});
  }

  public checkBlacklist(cin: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.adminUrl}/blacklist/check`, { params: { cin } as any });
  }
 uploadDocument(
  requestId: string,
  file: File,
  type: 'CIN' | 'FICHE_PAIE'
) {
  const formData = new FormData();
  formData.append('file', file); // 🔴 MUST be "file"
  formData.append('type', type);

  return this.http.post(
    `http://localhost:8081/api/admin/account-requests/${requestId}/documents`,
    formData
  );
}



public getAccountRequestById(id: string) {
  return this.http.get(
    `${this.adminUrl}/account-requests/${id}`
  );
}
public runCompliance(id: string) {
  return this.http.post(
    `${this.adminUrl}/account-requests/${id}/compliance`,
    {}
  );
}
public getDocumentsByRequest(requestId: string) {
  return this.http.get<any[]>(
    `${this.adminUrl}/account-requests/${requestId}/documents`
  );
}

  // Contract helpers
  public getContractUrl(accountRequestId: string) {
    return `${this.adminUrl}/contracts/${accountRequestId}/generate`;
  }

  public signContract(accountRequestId: string) {
    return this.http.post(`${this.adminUrl}/contracts/${accountRequestId}/sign`, {});
  }

  public getContractPreview(accountRequestId: string) {
    return this.http.get(`${this.adminUrl}/contracts/${accountRequestId}/preview`);
  }



}