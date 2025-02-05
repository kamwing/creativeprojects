import * as THREE from 'three';

import { UpdateInfo, StoryItemProps, Bounds } from './types';
import { InteractiveScene } from './InteractiveScene';
import { StoryItem3D } from './StoryItem3D';
import { MouseMove } from './MouseMove/MouseMove';

export class StoryScene extends InteractiveScene {
  _storyItems: StoryItem3D[] = [];
  _planeGeometry = new THREE.PlaneGeometry(1, 1, 50, 50);
  _setHoveredItem: React.Dispatch<React.SetStateAction<StoryItem3D | null>>;
  _loadedAmount = 0;

  constructor(
    camera: THREE.PerspectiveCamera,
    mouseMove: MouseMove,
    setHoveredItem: React.Dispatch<React.SetStateAction<StoryItem3D | null>>,
  ) {
    super(camera, mouseMove);
    this._setHoveredItem = setHoveredItem;
  }

  _onItemOver = (e: THREE.Event) => {
    this._setHoveredItem(e.target);
  };
  _onItemLeft = (e: THREE.Event) => {
    this._setHoveredItem(null);
  };

  _onItemLoaded = (e: THREE.Event) => {
    this._loadedAmount += 1;

    if (this._loadedAmount === this._storyItems.length) {
      this._storyItems.forEach(item => {
        item.init();
      });

      this._onSpiralLoaded();
    }
  };

  _onSpiralLoaded() {}

  _onItemClick = (e: THREE.Event) => {
    const targetIndex = (e.target as StoryItem3D).key;
    this._animateToIndex(targetIndex);
  };

  _destroyItems() {
    this._storyItems.forEach(item => {
      item.destroy();
      this.remove(item);
      item.removeEventListener('pointerover', this._onItemOver);
      item.removeEventListener('pointerleft', this._onItemLeft);
      item.removeEventListener('loaded', this._onItemLoaded);
      item.removeEventListener('click', this._onItemClick);
    });
    this._storyItems = [];
    this._loadedAmount = 0;
  }

  set items(items: StoryItemProps[]) {
    this._destroyItems();

    items &&
      items.forEach((item, key) => {
        const item3D = new StoryItem3D(this._planeGeometry, item, key);
        this._storyItems.push(item3D);
        this.add(item3D);
      });

    this._storyItems.forEach(storyItem => {
      storyItem.addEventListener('pointerover', this._onItemOver);
      storyItem.addEventListener('pointerleft', this._onItemLeft);
      storyItem.addEventListener('loaded', this._onItemLoaded);
      storyItem.addEventListener('click', this._onItemClick);
    });
  }

  set rendererBounds(bounds: Bounds) {
    super.rendererBounds = bounds;
    this._storyItems.forEach(item => {
      item.rendererBounds = bounds;
    });
  }

  _animateSpiralIn(targetIndex: number) {}

  _animateToIndex(targetIndex: number) {}

  update(updateInfo: UpdateInfo) {
    super.update(updateInfo);
    this._storyItems.forEach(item => {
      item.update(updateInfo);
    });
  }

  destroy() {
    super.destroy();
    this._destroyItems();
    this._planeGeometry.dispose();
  }
}
