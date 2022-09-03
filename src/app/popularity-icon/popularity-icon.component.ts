import { Component, Input, OnInit } from '@angular/core';
import { Popularity } from '../product.service';

@Component({
  selector: 'app-popularity-icon',
  templateUrl: './popularity-icon.component.html',
  styleUrls: ['./popularity-icon.component.scss']
})
export class PopularityIconComponent implements OnInit {
  @Input() popularity?: Popularity;
  constructor() { }

  ngOnInit(): void {
  }

}
