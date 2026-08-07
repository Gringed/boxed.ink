"use client";
import { useEffect, useRef, useState } from "react";

export function FadeInSection(props: any) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef(null);
  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      });
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);
  return (
    <div
      className={`mt-0 fade-in-section ${isVisible ? "is-visible" : ""}`}
      ref={domRef as any}
    >
      {props.children}
    </div>
  );
}
