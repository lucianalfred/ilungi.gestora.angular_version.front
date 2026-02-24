import { Injectable, signal, computed } from '@angular/core';
import { TRANSLATIONS, Translations } from '../constants/index';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private langSignal = signal<'pt' | 'en'>('pt');
  
  public lang = this.langSignal.asReadonly();
  public translations = computed<Translations>(() => TRANSLATIONS[this.langSignal()]);

  constructor() {
    const savedLang = localStorage.getItem('gestora_language') as 'pt' | 'en';
    if (savedLang) {
      this.langSignal.set(savedLang);
    }
  }

  setLanguage(lang: 'pt' | 'en') {
    this.langSignal.set(lang);
    localStorage.setItem('gestora_language', lang);
  }

  toggleLanguage() {
    this.setLanguage(this.lang() === 'pt' ? 'en' : 'pt');
  }
}