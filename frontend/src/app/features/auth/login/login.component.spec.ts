import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

const mockAuthService = {
  findUser: jest.fn(),
  createUser: jest.fn(),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        RouterTestingModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatDialogModule,
      ],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('form is valid with correct email', () => {
    component.form.setValue({ email: 'valid@example.com' });
    expect(component.form.valid).toBeTrue();
  });

  it('form is invalid with bad email', () => {
    component.form.setValue({ email: 'not-an-email' });
    expect(component.form.invalid).toBeTrue();
  });

  it('does not submit when form is invalid', () => {
    component.form.setValue({ email: '' });
    component.onSubmit();
    expect(mockAuthService.findUser).not.toHaveBeenCalled();
  });

  it('calls findUser on submit with valid email', () => {
    mockAuthService.findUser.mockReturnValue(of({ user: { id: '1', email: 'a@b.com' }, token: 'tok' }));
    component.form.setValue({ email: 'a@b.com' });
    component.onSubmit();
    expect(mockAuthService.findUser).toHaveBeenCalledWith('a@b.com');
  });
});
