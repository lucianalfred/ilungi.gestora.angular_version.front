import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { InitService } from '../services/init.service';

export const appInitGuard: CanActivateFn = async () => {
  const initService = inject(InitService);
  
  try {
    await initService.initializeApp();
    return true;
  } catch (error) {
    console.error('Erro na inicialização da aplicação:', error);
    return true; 
  }
};