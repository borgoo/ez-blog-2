class SimpleSlider {
  constructor(root) {
    if (!root || root.dataset.simpleSliderReady === 'true') {
      return;
    }

    this.root = root;
    this.slides = Array.from(
      root.querySelectorAll('[data-simple-slider-slide]')
    );

    if (!this.slides.length) {
      return;
    }

    this.currentIndex = 0;
    this.totalSlides = this.slides.length;

    this.enhanceSlides();
    this.createControls();
    this.enableFullscreen();
    this.attachEvents();
    this.showSlide(0);

    this.root.dataset.simpleSliderReady = 'true';
  }

  enhanceSlides() {
    this.slides.forEach((slide, idx) => {
      slide.classList.add('simple-slider__slide');
      slide.setAttribute('role', 'group');
      slide.setAttribute(
        'aria-label',
        `Slide ${idx + 1} of ${this.totalSlides}`
      );
      slide.setAttribute('aria-hidden', 'true');
      slide.hidden = true;
    });
  }

  enableFullscreen() {
    this.slides.forEach((slide) => {
      const image = slide.querySelector('img');
      if (!image) {
        return;
      }

      if (!image.classList.contains('simple-slider__image')) {
        image.classList.add('simple-slider__image');
      }

      image.setAttribute('role', 'button');
      image.setAttribute('tabindex', '0');
      image.setAttribute('aria-haspopup', 'dialog');

      const openFullscreen = () => SimpleSlider.showFullscreen(image);

      image.addEventListener('click', openFullscreen);
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openFullscreen();
        }
      });
    });
  }

  createControls() {
    this.controls = document.createElement('div');
    this.controls.className = 'simple-slider__controls';

    this.prevButton = document.createElement('button');
    this.prevButton.type = 'button';
    this.prevButton.className =
      'simple-slider__button simple-slider__button--prev';
    this.prevButton.setAttribute('aria-label', 'Previous slide');
    this.prevButton.textContent = 'Previous';

    this.status = document.createElement('div');
    this.status.className = 'simple-slider__status';
    this.status.setAttribute('aria-live', 'polite');
    this.status.setAttribute('aria-atomic', 'true');

    this.nextButton = document.createElement('button');
    this.nextButton.type = 'button';
    this.nextButton.className =
      'simple-slider__button simple-slider__button--next';
    this.nextButton.setAttribute('aria-label', 'Next slide');
    this.nextButton.textContent = 'Next';

    this.controls.append(this.prevButton, this.status, this.nextButton);
    this.root.append(this.controls);
  }

  attachEvents() {
    this.prevButton.addEventListener('click', () => this.showPrevious());
    this.nextButton.addEventListener('click', () => this.showNext());

    this.root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.showPrevious();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.showNext();
      }
    });
  }

  showPrevious() {
    const nextIndex =
      (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.showSlide(nextIndex);
  }

  showNext() {
    const nextIndex = (this.currentIndex + 1) % this.totalSlides;
    this.showSlide(nextIndex);
  }

  showSlide(index) {
    if (index < 0 || index >= this.totalSlides) {
      return;
    }

    this.slides.forEach((slide, idx) => {
      const isActive = idx === index;
      slide.classList.toggle('is-active', isActive);
      slide.hidden = !isActive;
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    this.currentIndex = index;
    this.status.textContent = `Step ${index + 1} of ${this.totalSlides}`;
  }

  static ensureOverlay() {
    if (SimpleSlider.overlayElement) {
      return SimpleSlider.overlayElement;
    }

    const overlay = document.createElement('div');
    overlay.className = 'simple-slider__overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Full screen image preview');
    overlay.hidden = true;
    overlay.tabIndex = -1;

    const figure = document.createElement('figure');
    figure.className = 'simple-slider__overlay-content';
    figure.tabIndex = -1;

    const image = document.createElement('img');
    image.className = 'simple-slider__overlay-image';
    image.alt = '';

    const caption = document.createElement('figcaption');
    caption.className = 'simple-slider__overlay-caption';
    caption.hidden = true;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'simple-slider__overlay-close';
    closeButton.textContent = 'Close';
    closeButton.setAttribute('aria-label', 'Close full screen view');

    figure.append(image, caption);
    overlay.append(figure, closeButton);
    document.body.appendChild(overlay);

    const hide = () => SimpleSlider.hideFullscreen();

    closeButton.addEventListener('click', hide);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        hide();
      }
    });

    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        hide();
      }
    });

    SimpleSlider.overlayElement = overlay;
    SimpleSlider.overlayImage = image;
    SimpleSlider.overlayCaption = caption;

    return overlay;
  }

  static showFullscreen(imageEl) {
    const overlay = SimpleSlider.ensureOverlay();
    const description =
      imageEl.getAttribute('data-simple-slider-caption') ||
      imageEl.getAttribute('alt') ||
      '';

    SimpleSlider.lastActiveElement = document.activeElement;

    SimpleSlider.overlayImage.src = imageEl.currentSrc || imageEl.src;
    SimpleSlider.overlayImage.alt = imageEl.alt || '';

    if (description.trim()) {
      SimpleSlider.overlayCaption.textContent = description;
      SimpleSlider.overlayCaption.hidden = false;
    } else {
      SimpleSlider.overlayCaption.textContent = '';
      SimpleSlider.overlayCaption.hidden = true;
    }

    overlay.hidden = false;

    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
      overlay.focus();
    });

    document.body.dataset.simpleSliderScrollLock = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
  }

  static hideFullscreen() {
    const overlay = SimpleSlider.ensureOverlay();

    overlay.classList.remove('is-visible');
    overlay.hidden = true;

    document.body.style.overflow = document.body.dataset.simpleSliderScrollLock || '';
    delete document.body.dataset.simpleSliderScrollLock;

    if (
      SimpleSlider.lastActiveElement &&
      typeof SimpleSlider.lastActiveElement.focus === 'function'
    ) {
      SimpleSlider.lastActiveElement.focus();
    }
  }

  static initAll(scope = document) {
    const roots = scope.querySelectorAll('[data-simple-slider]');
    roots.forEach((root) => new SimpleSlider(root));
  }
}

window.SimpleSlider = SimpleSlider;

document.addEventListener('DOMContentLoaded', () => {
  SimpleSlider.initAll();
});

