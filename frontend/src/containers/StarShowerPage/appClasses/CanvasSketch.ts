import { Event } from 'three';

import { MouseMove } from './MouseMove/MouseMove';
import { UpdateInfo } from './types';
import { BigStar } from './BigStar';
import { MiniStar } from './MiniStar';
import { RendererBounds } from './types';

export class CanvasSketch {
  _mouseMove: MouseMove;
  _mouseX = 0;
  _mouseY = 0;
  _ctx: CanvasRenderingContext2D;
  _rendererBounds: RendererBounds = { width: 300, height: 200 };
  _starsArray: BigStar[] = [];
  _miniStarsArray: MiniStar[] = [];
  _backgroundGradient: CanvasGradient | null = null;

  constructor(ctx: CanvasRenderingContext2D, mouseMove: MouseMove) {
    this._ctx = ctx;
    this._mouseMove = mouseMove;
  }

  init() {
    this._addEventListeners();
    this._generateStars();

    //Create background
    this._backgroundGradient = this._ctx.createLinearGradient(
      0,
      0,
      0,
      this._rendererBounds.height,
    );
    this._backgroundGradient.addColorStop(0, '#171e26');
    this._backgroundGradient.addColorStop(1, '#3f586b');
  }

  _onStarDestroyMiniStar = (e: Event) => {
    const indexToRemove = this._miniStarsArray.indexOf(e.target);
    if (indexToRemove > -1) {
      this._miniStarsArray.splice(indexToRemove, 1);
    }
  };

  set rendererBounds(bounds: RendererBounds) {
    this._rendererBounds = bounds;
  }

  _onStarHit = (e: Event) => {
    for (let i = 0; i < 8; i++) {
      this._miniStarsArray.push(new MiniStar(e.target._x, e.target._y, 2));
    }
    this._miniStarsArray.forEach(star => {
      star.addEventListener('destroyministar', this._onStarDestroyMiniStar);
    });
  };

  _onStarDestroy = (e: Event) => {
    const indexToRemove = this._starsArray.indexOf(e.target);
    if (indexToRemove > -1) {
      this._starsArray.splice(indexToRemove, 1);
    }
  };

  _generateStars() {
    for (let i = 0; i < 1; i++) {
      this._starsArray.push(
        new BigStar(this._rendererBounds.width / 2, 30, 30, 'blue'),
      );
    }
    this._starsArray.forEach(star => {
      star.addEventListener('starhit', this._onStarHit);
    });
    this._starsArray.forEach(star => {
      star.addEventListener('destroystar', this._onStarDestroy);
    });
  }

  _createMountainRange(amount: number, height: number, color: string) {
    for (let i = 0; i < amount; i++) {
      const mountainWidth = this._rendererBounds.width / amount;
      this._ctx.beginPath();
      this._ctx.moveTo(i * mountainWidth, this._rendererBounds.height);
      this._ctx.lineTo(
        i * mountainWidth + mountainWidth,
        this._rendererBounds.height,
      );
      this._ctx.lineTo(
        i * mountainWidth + mountainWidth * 0.5,
        this._rendererBounds.height - height,
      );
      this._ctx.lineTo(i * mountainWidth, this._rendererBounds.height);
      this._ctx.fillStyle = color;
      this._ctx.fill();
      this._ctx.closePath();
    }
  }

  update(updateInfo: UpdateInfo) {
    if (this._backgroundGradient) {
      this._ctx.fillStyle = this._backgroundGradient;
    }
    this._clear();
    this._createMountainRange(3, 100, 'white');
    this._ctx.fillText(
      `x: ${Math.trunc(this._mouseX)}, y: ${Math.trunc(this._mouseY)}`,
      this._mouseX,
      this._mouseY,
    );

    this._miniStarsArray.forEach(star => {
      star.update(updateInfo, this._rendererBounds, this._ctx);
    });
    this._starsArray.forEach(star => {
      star.update(updateInfo, this._rendererBounds, this._ctx);
    });
  }

  _clear() {
    this._ctx.fillRect(
      0,
      0,
      this._rendererBounds.width,
      this._rendererBounds.height,
    );
  }

  _onResize = () => {};

  _onMouseMove = (e: Event) => {
    this._mouseX = (e.target as MouseMove).mouseLerp.x;
    this._mouseY = (e.target as MouseMove).mouseLerp.y;
  };

  _addEventListeners() {
    window.addEventListener('resize', this._onResize);
    this._mouseMove.addEventListener('mousemoved', this._onMouseMove);
  }
  _removeEventListeners() {
    window.removeEventListener('resize', this._onResize);
    this._mouseMove.removeEventListener('mousemoved', this._onMouseMove);
  }

  destroy() {
    this._removeEventListeners();
    this._starsArray.forEach(star => {
      star.removeEventListener('starhit', this._onStarHit);
    });
    this._starsArray.forEach(star => {
      star.removeEventListener('destroystar', this._onStarDestroy);
    });
  }
}
