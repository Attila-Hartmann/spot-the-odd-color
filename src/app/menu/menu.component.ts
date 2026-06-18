import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { brighten, generateBoxColor } from '../utils/box-color.utils';

const LOGO_GRID_SIZE = 5;

/** A decorative box for the menu's logo grid. */
interface LogoCell {
  color: string;
  isOdd: boolean;
}

@Component({
  selector: 'app-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class Menu {
  /**
   * A small spot-the-odd-box grid used purely as a logo/hero — generated once
   * with the same colour utilities the game uses, so it previews the mechanic.
   */
  protected readonly logoCells = this.buildLogoGrid();

  private buildLogoGrid(): LogoCell[] {
    const base = generateBoxColor();
    const odd = brighten(base, 28);
    const count = LOGO_GRID_SIZE * LOGO_GRID_SIZE;
    const oddIndex = Math.floor(Math.random() * count);
    return Array.from({ length: count }, (_, i) => ({
      color: i === oddIndex ? odd : base,
      isOdd: i === oddIndex,
    }));
  }
}
