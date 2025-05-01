"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import Head from 'next/head';

// Dynamically import the A-Frame scene to prevent SSR
const ARScene = dynamic(
  () => Promise.resolve(() => (
    <div style={{ margin: 0, overflow: 'hidden', height: '100vh' }}>
      <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false;">
        <a-marker type="pattern" url="/public/images/pattern-hiro.patt">
          <a-plane
            id="imagePlane"
            position="0 0 0"
            rotation="-90 0 0"
            width="4"
            height="2.25"
            material="shader: flat; scale: 2 2 2; src: /images/jobblaze.png"
          />
        </a-marker>
        <a-entity camera />
      </a-scene>
    </div>
  )),
  { ssr: false, loading: () => <div>Loading AR Scene...</div> }
);

const CameraPage = () => {
  return (
    <>
      <Head>
        <title>Test AR #1</title>
      </Head>
      {/* Load A-Frame and AR.js scripts */}
      <Script
        src="https://aframe.io/releases/1.2.0/aframe.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/scripts/aframe-ar.js"
        strategy="afterInteractive"
      />
      <ARScene />
    </>
  );
};

export default CameraPage;