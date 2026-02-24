import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export function createDebounce<T>(delay: number = 300): [Subject<T>, Observable<T>] {
  const subject = new Subject<T>();
  const observable = subject.pipe(
    debounceTime(delay),
    distinctUntilChanged()
  );
  return [subject, observable];
}