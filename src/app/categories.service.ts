import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriesApi, Category } from './api/categories.api';
import { ConstraintViolationsProblem } from './api/problem';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private api: CategoriesApi) { }

  getCategories(): Observable<Category[]> {
    return this.api.getAll();
  }

  save(name: string, category?: Category): Observable<Category | ConstraintViolationsProblem> {
    if (category) {
      return this.update(category, name)
    } else {
      return this.create(name)
    }
  }

  delete(category: Category): Observable<void> {
    return this.api.delete(category)
  }

  private update(category: Category, name: string): Observable<Category | ConstraintViolationsProblem> {
    category.name = name
    return this.api.put(category)
  }

  private create(name: string): Observable<Category | ConstraintViolationsProblem> {
    return this.api.post({
      name: name
    });
  }
}
