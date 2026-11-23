# Worklog — Phoenix Three dual-plane flight

- Title: Worklog — Phoenix Three dual-plane flight
- WHY: DOM stickers -> true WebGL companions on shared canvas for premium 3D feel without a second scene
- Notion sync: yes
- Date: 2026-11-24

## Summary of Changes

1. **Dual-plane articulated phoenix groups in existing Three.js scene**:
   - Reused shared canvas #three-bg and existing camera (FOV 50, z=18).
   - Created dual-plane meshes (body plane + wing plane) per bird using THREE.PlaneGeometry.
   - Single shared canvas atlas texture rasterized from SVG with body + tail on left half and wings on right half (capped at 512px on desktop, 256px on mobile).
   - Wing mesh pivoted at root (offset corresponding to SVG wing base at 95, 65) with independent flapping wing.rotation.z and fluttering wing.rotation.x.
   - Mirrored right phoenix with scale.x = -1.

2. **Cubic Bézier scroll flight mapping**:
   - Mapped viewport percentage along PHOENIX_BEZIER_LEFT and PHOENIX_BEZIER_RIGHT to Three.js world coordinates using viewportPercentToWorld(xPct, yPct, depthZ, camera, aspect) at depth z = 4..8 with swooping depth.
   - Derived banking rotations via headingFromBezier(dx, dy).
   - Merged scroll lerp into main Three.js renderLoop (single rAF loop, no secondary GPU ticker).

3. **Soft gold ember trail**:
   - Soft gold THREE.Points (around 40 points desktop, 18 mobile) with depthWrite: false and THREE.AdditiveBlending.
   - Recycled toward each phoenix world position each frame with subtle drift and age fade. Token gold color only (0xfde68a), strictly avoiding purple.

4. **DOM fallback & reduced-motion coexistence**:
   - When 3D phoenix initializes, #phoenix-stage receives is-webgl class to cleanly hide DOM flyers (opacity: 0; visibility: hidden;).
   - If WebGL throws or fails, DOM flyer path flight continues smoothly as fallback.
   - When prefers-reduced-motion: reduce is active, Three.js companions are skipped and DOM flyers remain parked in corners.
   - CSS comment stamp updated to include phoenix-three-v1.
