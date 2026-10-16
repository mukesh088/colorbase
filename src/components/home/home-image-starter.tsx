"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ImagePlus, ScanEye, Download } from "lucide-react";

const ImageWorkspace = dynamic(
  () => import("@/components/tools/image-color-tools").then((m) => m.ImageColorTools),
  {
    ssr: false,
    loading: () => (
      <p role="status" className="home-image-loading">
        Opening your image workspace…
      </p>
    ),
  }
);

export function HomeImageStarter() {
  const [open, setOpen] = useState(false);
  return (
    <section className="home-image-feature" aria-labelledby="home-image-heading">
      <div className="home-image-intro">
        <div>
          <p className="home-studio-eyebrow">YOUR INSPIRATION, DECODED</p>
          <h2 id="home-image-heading">Great colors are already around you.</h2>
          <p>
            Bring a photo, screenshot, or moodboard. Sample exact pixels, collect a palette, and
            take it straight into your next design.
          </p>
        </div>
        <Link href="/image-color-picker">
          Open Image Picker <ArrowRight size={15} />
        </Link>
      </div>
      {open ? (
        <ImageWorkspace mode="picker" />
      ) : (
        <div className="home-image-launch">
          <div className="home-image-mosaic" aria-hidden="true">
            {["#dce8df", "#879c8d", "#e7b894", "#c36f56", "#475b58", "#f5eadc"].map((hex) => (
              <span key={hex} style={{ background: hex }} />
            ))}
          </div>
          <div>
            <span className="home-studio-eyebrow">IMAGE COLOR PICKER</span>
            <h3>From a single pixel to a complete palette.</h3>
            <div className="home-image-benefits">
              <span>
                <ImagePlus size={15} />
                Upload, drop, or paste
              </span>
              <span>
                <ScanEye size={15} />
                Zoom into the details
              </span>
              <span>
                <Download size={15} />
                Export usable colors
              </span>
            </div>
            <button type="button" onClick={() => setOpen(true)}>
              Try it on this page <ArrowRight size={15} />
            </button>
            <p>Processed in your browser. No image upload to our server.</p>
          </div>
        </div>
      )}
    </section>
  );
}
