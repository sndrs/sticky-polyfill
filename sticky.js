export default class Sticky {

  constructor (selector, top = 0) {
    this.$sticky = document.querySelector(selector);
    const stickyStyles = window.getComputedStyle(this.$sticky);

    // already support sticky natively, so leave
    if (/sticky/.test(stickyStyles.getPropertyValue("position"))) {
      return false;
    }

    this.stickyTop = top;

    console.log(this.stickyTop);

    this.$stickyParent = this.$sticky.parentElement;
    const stickyParentStyles = window.getComputedStyle(this.$stickyParent);

    this.state = 'initial';
    this.scrollOffset = window.scrollY;

    this.isWriting = false;
    this.isReading = false;

    this.boundRender = this.render.bind(this);

    if (stickyParentStyles.getPropertyValue("position") === 'static') {
      this.$stickyParent.style.position = 'relative';
    }

    window.addEventListener('scroll', this.boundRender)
  }

  stick () {
    requestAnimationFrame(this.boundRender);
  }

  render () {
    this.isReading || this.read(() => {
      const stickyHeight = this.$sticky.offsetHeight;
      const stickyParentBounds = this.$stickyParent.getBoundingClientRect();

      if (this.parentShouldPickUpElement(stickyParentBounds.bottom, stickyHeight)) {
        this.pickUp()
      } else if (this.elementShouldStick(stickyParentBounds.top)) {
        this.makeStuck()
      } else {
        this.makeStatic()
      }
    });
  }

  parentShouldPickUpElement (stickyParentBottom, stickyHeight) {
    return stickyParentBottom <= this.stickyTop + stickyHeight;
  }

  elementShouldStick (stickyParentTop) {
    return stickyParentTop <= this.stickyTop;
  }

  // fix the element to the viewport if we've scrolled enough
  makeStuck () {
    if (this.state !== 'stuck') {
      console.log('fixing to viewport')

      this.write(() => {
        this.$sticky.style.position = 'fixed';
        this.$sticky.style.top = `${this.stickyTop}px`;
        this.$sticky.style.bottom = null;
        this.state = 'stuck';
      })
    }
  }

  // pin the element to the bottom of its parent if we've scrolled too far
  pickUp () {
    if (this.state !== 'pickedUp') {
      console.log('pinning to parent bottom')

      this.write(() => {
        this.$sticky.style.position = 'absolute';
        this.$sticky.style.top = 'auto';
        this.$sticky.style.bottom = '0px';
        this.state = 'pickedUp';
      })
    }
  }

  // return the element to natural flow
  makeStatic () {
    if (this.state !== 'initial') {
      console.log('returning to flow')

      this.write(() => {
        this.$sticky.style.position = 'static';
        this.state = 'initial';
      })
    }
  }

  read (callback) {
    if (!this.isReading) {
      console.log('reading')
      this.isReading = true;
      requestAnimationFrame(() => {
        callback();
        this.isReading = false;
      });
    }
  }

  write (callback) {
    if (!this.isWriting) {
      console.log('writing')
      this.isWriting = true;
      requestAnimationFrame(() => {
        callback();
        this.isWriting = false;
      });
    }
  }
}