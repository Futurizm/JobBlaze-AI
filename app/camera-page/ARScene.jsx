// "use client";

// import React, { useEffect } from 'react';
// import { Scene, Entity } from 'aframe-react';
// import 'aframe'; // Import A-Frame core
// import dynamic from 'next/dynamic';

// const ARScene = () => {
//   // Load AR.js script dynamically (use local copy in production)
//   useEffect(() => {
//     const arjsScript = documentu.createElement('script');
//     // For local copy (preferred):
//     arjsScript.src = '/scripts/aframe-ar.js';
//     // For CDN (development only):
//     // arjsScript.src = 'https://rawcdn.githack.com/AR-js-org/AR.js/2.1.7/aframe/build/aframe-ar.js';
//     arjsScript.async = true;
//     document.body.appendChild(arjsScript);

//     return () => {
//       if (arjsScript.parentNode) {
//         arjsScript.parentNode.removeChild(arjsScript); // Cleanup on unmount
//       }
//     };
//   }, []);

//   return (
//     <div style={{ margin: 0, overflow: 'hidden', height: '100vh' }}>
//       <Scene
//         embedded
//         arjs="sourceType: webcam; debugUIEnabled: false;"
//       >
//         <Entity
//           primitive="a-marker"
//           type="pattern"
//           url="/public/images/pattern-hiro.patt"
//         >
//           <Entity
//             primitive="a-plane"
//             id="imagePlane"
//             position="0 0 0"
//             rotation="-90 0 0"
//             width="4"
//             height="2.25"
//             material="shader: flat; scale: 2 2 2; src: /public/images/avatar.png"
//           />
//         </Entity>
//         <Entity primitive="a-entity" camera />
//       </Scene>
//     </div>
//   );
// };

// export default dynamic(() => Promise.resolve(ARScene), { ssr: false });