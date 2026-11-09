import { AdminDashboardComponent } from './admin-dashboard';

class MockClientService {}

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;

  beforeEach(() => {
    component = new AdminDashboardComponent(new MockClientService() as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters demandes by searchText', () => {
    component.searchText = 'Sara';
    const results = component.filteredRequests();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].prenom).toContain('Sara');
  });
});
