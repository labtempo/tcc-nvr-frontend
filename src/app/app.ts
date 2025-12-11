import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './loading/loading';
import { LoadingService } from './loading/loading.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ToastComponent } from './shared/toast/toast.component';
import { ConfirmDialogComponent, ConfirmDialogService } from './shared/confirm-dialog/confirm-dialog.service';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoadingComponent,
    CollapseModule,
    ToastComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'tcc-nvr-frontend';
  isCollapsed = true;

  constructor(
    public loadingService: LoadingService,
    private confirmService: ConfirmDialogService
  ) { }

  @ViewChild(ConfirmDialogComponent) set confirmDialog(content: ConfirmDialogComponent) {
    if (content) this.confirmService.register(content);
  }
}