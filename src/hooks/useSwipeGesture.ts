"use client";

import { useEffect, useRef } from "react";

export default function useSwipeGesture(
  TypeOfSwipe: "x-axis" | "y-axis",
  onSwipeAction: [() => void, () => void],
  minimumSwipeActivateThreshold: number
): void {
  const onSwipeActionRef = useRef(onSwipeAction);

  useEffect(() => {
    onSwipeActionRef.current = onSwipeAction;
  }, [onSwipeAction]);

  useEffect(() => {
    let x_swipe = false;
    let y_swipe = false;
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;
    const swipeOption = ['x-axis', 'y-axis'];

    if (TypeOfSwipe === swipeOption[0]) {
      x_swipe = true;
    } else if (TypeOfSwipe === swipeOption[1]) {
      y_swipe = true;
    } else {
      console.error('Type of swipe invalid, only: x-axis or y-axis');
      return;
    }

    if (onSwipeAction.length !== 2) {
      console.error('the array of function of onSwipeAction must contain 2 elements only');
      return;
    } else {
      if (!(typeof onSwipeAction[0] === 'function' && typeof onSwipeAction[1] === 'function')) {
        console.error('the elements provided in the onSwipeAction arrays are not a function ! it must be a function');
        return;
      }
    }
    const minimum_threshold = minimumSwipeActivateThreshold;

    function touchstart(event: TouchEvent) {
      const target = event.target as HTMLElement | null;
      if (target) {
        const ignoredSelectors = [
          'a',
          'button',
          'input',
          'select',
          'textarea',
          '[role="tablist"]',
          '[role="tab"]',
          '[role="menu"]',
          '[role="menuitem"]',
          '[role="dialog"]',
          '.no-swipe'
        ];
        const isIgnored = ignoredSelectors.some(selector => target.closest(selector));
        if (isIgnored) {
          touchstartX = 0;
          touchstartY = 0;
          return;
        }
      }
      touchstartX = event.changedTouches[0].screenX;
      touchstartY = event.changedTouches[0].screenY;
    }

    function touchend(event: TouchEvent) {
      if (touchstartX === 0 && touchstartY === 0) return;
      touchendX = event.changedTouches[0].screenX;
      touchendY = event.changedTouches[0].screenY;
      handleGesture();
      touchstartX = 0;
      touchstartY = 0;
    }

    window.addEventListener('touchstart', touchstart, false);
    window.addEventListener('touchend', touchend, false);

    function handleGesture() {
      if (touchstartX === 0 && touchstartY === 0) return;
      if (x_swipe) {
        if (touchendX < touchstartX && touchstartX - touchendX >= minimum_threshold && Math.abs(touchendY - touchstartY) <= 80) {
          onSwipeActionRef.current[0]();
        } else if (touchendX - touchstartX >= minimum_threshold && Math.abs(touchendY - touchstartY) <= 80) {
          onSwipeActionRef.current[1]();
        }
      } else {
        if (touchendY < touchstartY && touchstartY - touchendY >= minimum_threshold && Math.abs(touchendX - touchstartX) <= 80) {
          onSwipeActionRef.current[0]();
        } else if (touchendY - touchstartY >= minimum_threshold && Math.abs(touchendX - touchstartX) <= 80) {
          onSwipeActionRef.current[1]();
        }
      }
    }

    return () => {
      window.removeEventListener('touchstart', touchstart);
      window.removeEventListener('touchend', touchend);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TypeOfSwipe, minimumSwipeActivateThreshold]);
}
