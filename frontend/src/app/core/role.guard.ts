import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
export const authGuard: CanActivateFn = () => {
  const a = inject(AuthService),
    r = inject(Router);
  return a.isLoggedIn() ? true : r.createUrlTree(["/login"]);
};
export const roleGuard =
  (role: "TRAINER" | "POD_LEAD"): CanActivateFn =>
  () => {
    const a = inject(AuthService),
      r = inject(Router);
    if (!a.isLoggedIn()) return r.createUrlTree(["/login"]);
    return a.user()?.role === role ? true : r.createUrlTree(["/dashboard"]);
  };
