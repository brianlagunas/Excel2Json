import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyFilesComponent } from './my-files.component';

const routes: Routes = [{ path: '', component: MyFilesComponent, data: { text: 'My Files' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyFilesRoutingModule { }