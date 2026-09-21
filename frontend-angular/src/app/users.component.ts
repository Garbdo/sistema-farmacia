import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <div class="eyebrow">SEGURIDAD</div>
        <h1>Usuarios</h1>
        <p>Administra las cuentas, roles y estado de acceso al sistema.</p>
      </div>
      <button class="btn primary" (click)="openCreate()">＋ Nuevo usuario</button>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon blue">U</div>
        <div><small>TOTAL USUARIOS</small><strong>{{ users.length }}</strong><em>cuentas registradas</em></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✓</div>
        <div><small>ACTIVOS</small><strong>{{ activeCount }}</strong><em>con acceso habilitado</em></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber">!</div>
        <div><small>INACTIVOS</small><strong>{{ users.length - activeCount }}</strong><em>acceso deshabilitado</em></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon violet">R</div>
        <div><small>ROLES</small><strong>{{ roles.length }}</strong><em>disponibles</em></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <b>Usuarios registrados</b>
          <small>Crear, editar y activar o desactivar cuentas</small>
        </div>
        <button class="btn sm ghost" (click)="load()">↻ Actualizar</button>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td><b>{{ u.usuario }}</b></td>
              <td>{{ u.nombre }}</td>
              <td><span class="badge blue">{{ u.rol }}</span></td>
              <td>
                <span class="badge" [class.green]="u.activo" [class.bad]="!u.activo">
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <button class="link-btn" (click)="openEdit(u)">Editar</button>
                <button class="link-btn" (click)="toggle(u.id)">
                  {{ u.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="!users.length">
              <td colspan="5" class="empty">No hay usuarios registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <div>
            <b>{{ editing ? 'Editar usuario' : 'Crear usuario' }}</b>
            <small>{{ editing ? 'Modifica los datos de la cuenta' : 'Registra una nueva cuenta de acceso' }}</small>
          </div>
          <button type="button" (click)="closeModal()">×</button>
        </div>

        <form (ngSubmit)="save()">
          <div class="form-grid">
            <label>
              Nombre completo
              <input name="nombre" [(ngModel)]="form.nombre" placeholder="Ej. Juan Pérez" required />
            </label>

            <label>
              Nombre de usuario
              <input name="usuario" [(ngModel)]="form.usuario" placeholder="Ej. jperez" required />
            </label>

            <label>
              Rol
              <select name="rol_id" [(ngModel)]="form.rol_id" required>
                <option [ngValue]="null" disabled>Seleccionar rol</option>
                <option *ngFor="let r of roles" [ngValue]="r.id">{{ r.nombre }}</option>
              </select>
            </label>

            <label>
              {{ editing ? 'Nueva contraseña (opcional)' : 'Contraseña' }}
              <input
                name="password"
                type="password"
                [(ngModel)]="form.password"
                [required]="!editing"
                placeholder="••••••••"
              />
            </label>
          </div>

          <label class="check" *ngIf="editing">
            <input type="checkbox" name="activo" [(ngModel)]="form.activo" />
            Usuario activo
          </label>

          <div class="error" *ngIf="error">{{ error }}</div>

          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="closeModal()">Cancelar</button>
            <button type="submit" class="btn primary" [disabled]="saving">
              {{ saving ? 'Guardando...' : (editing ? 'Guardar cambios' : 'Crear usuario') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="toast" *ngIf="message">{{ message }}</div>
  `
})
export class UsersComponent {
  api = inject(ApiService);

  users: any[] = [];
  roles: any[] = [];
  showModal = false;
  editing = false;
  saving = false;
  error = '';
  message = '';

  form: any = this.emptyForm();

  ngOnInit() {
    this.load();
  }

  get activeCount() {
    return this.users.filter(u => Number(u.activo) === 1).length;
  }

  emptyForm() {
    return {
      id: 0,
      nombre: '',
      usuario: '',
      password: '',
      rol_id: null,
      activo: true
    };
  }

  load() {
    this.api.usuarios().subscribe({
      next: r => {
        this.users = r.usuarios || [];
        this.roles = r.roles || [];
      },
      error: err => {
        this.error = err?.error?.mensaje || 'No se pudieron cargar los usuarios.';
      }
    });
  }

  openCreate() {
    this.editing = false;
    this.error = '';
    this.form = this.emptyForm();

    if (this.roles.length) {
      this.form.rol_id = this.roles[0].id;
    }

    this.showModal = true;
  }

  openEdit(user: any) {
    this.editing = true;
    this.error = '';
    this.form = {
      id: user.id,
      nombre: user.nombre || '',
      usuario: user.usuario || '',
      password: '',
      rol_id: user.rol_id,
      activo: Number(user.activo) === 1
    };
    this.showModal = true;
  }

  closeModal() {
    if (this.saving) return;
    this.showModal = false;
    this.error = '';
  }

  save() {
    this.error = '';

    if (!this.form.nombre?.trim() || !this.form.usuario?.trim() || !this.form.rol_id) {
      this.error = 'Completa nombre, usuario y rol.';
      return;
    }

    if (!this.editing && !this.form.password) {
      this.error = 'La contraseña es obligatoria para un nuevo usuario.';
      return;
    }

    this.saving = true;

    const body = {
      id: this.editing ? this.form.id : 0,
      nombre: this.form.nombre.trim(),
      usuario: this.form.usuario.trim(),
      password: this.form.password || '',
      rol_id: Number(this.form.rol_id),
      activo: this.form.activo
    };

    this.api.guardarUsuario(body).subscribe({
      next: r => {
        this.saving = false;
        this.showModal = false;
        this.message = r?.mensaje || (this.editing ? 'Usuario actualizado.' : 'Usuario creado.');
        this.load();
        setTimeout(() => this.message = '', 2500);
      },
      error: err => {
        this.saving = false;
        this.error = err?.error?.mensaje || 'No se pudo guardar el usuario.';
      }
    });
  }

  toggle(id: number) {
    this.api.toggleUsuario(id).subscribe({
      next: r => {
        this.message = r?.mensaje || 'Estado modificado.';
        this.load();
        setTimeout(() => this.message = '', 2000);
      },
      error: err => {
        this.error = err?.error?.mensaje || 'No se pudo modificar el estado.';
      }
    });
  }
}
