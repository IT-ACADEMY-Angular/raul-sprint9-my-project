// src/app/validators/login.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class LoginValidators {
  // Validador para email: revisa que tenga un formato correcto
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Si está vacío, se maneja con required
      }
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const valid = regex.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }

  // Validador para contraseña: mínimo 6 caracteres (por ejemplo)
  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      return control.value.length >= 6 ? null : { weakPassword: true };
    };
  }
}
