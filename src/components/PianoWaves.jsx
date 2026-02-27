import React from 'react';

const clampFeel = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(14, Math.max(0, numeric));
};

const buildTransform = (value, offset) => {
  const clamped = clampFeel(value);
  const t = (14 - clamped) / 13; // 0 -> at rest, 1 -> fully offscreen
  const x = (offset.x * t).toFixed(2);
  const y = (offset.y * t).toFixed(2);
  return `translate(${x}vw, ${y}vh)`;
};

const OFFSETS = {
  top: { x: 0, y: -30 },
  bottom: { x: 0, y: 30 },
  left: { x: -30, y: 0 },
  right: { x: 30, y: 0 },
  topLeft: { x: -30, y: -30 },
  topRight: { x: 30, y: -30 },
  bottomLeft: { x: -30, y: 30 },
  bottomRight: { x: 30, y: 30 },
};

const PianoWaves = ({ playFeel }) => {
  const feel = React.useMemo(() => ({
    light: clampFeel(playFeel?.high ?? 1),
    medium: (() => {
      const raw = clampFeel(playFeel?.mid ?? 1);
      return 1 + (raw - 1) * 0.7;
    })(),
    dark: clampFeel(playFeel?.low ?? 1),
  }), [playFeel?.high, playFeel?.mid, playFeel?.low]);

  return (
    <div className="piano-waves">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.light, OFFSETS.bottomRight) }}
          d="M1237.14 1115.69C1321.7 719.707 1153 477.572 1449.5 518.072C1746 558.572 1949.65 130.043 1949.65 539.717C1949.65 949.39 1189.63 1338.17 1237.14 1115.69Z"
          fill="#EEDEC5"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.light, OFFSETS.topRight) }}
          d="M864.318 60.4765C834.7 -120.724 589.703 -138.317 685.633 -212.549C781.562 -286.782 1206.21 -232.048 1359.64 -162.626C1513.07 -93.2047 1959.95 -20.6657 1813.26 278.961C1703.79 502.549 1498.95 304.679 1286 390.947C1073.06 477.215 904.955 309.088 864.318 60.4765Z"
          fill="#EEDEC5"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.light, OFFSETS.bottomLeft) }}
          d="M747.669 891.223C550.891 939.462 209.961 1244.97 117.235 960.445C24.5094 675.92 -279.617 748.526 -81.1909 500.826C117.235 253.125 944.447 842.983 747.669 891.223Z"
          fill="#EEDEC5"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.light, OFFSETS.topLeft) }}
          d="M-189.807 424.576C-358.893 655.347 -226.45 -311.618 136.279 -211.603C499.007 -111.587 606.751 -461.722 755.642 -88.9592C904.532 283.804 -20.7216 193.804 -189.807 424.576Z"
          fill="#EEDEC5"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.medium, OFFSETS.top) }}
          d="M801.5 129.5C710.074 129.5 669 253.5 556 239.5C454.5 226.925 306.073 90.8709 335.66 -48.6443C372.642 -223.038 539.806 -189.925 710.074 -135.027C880.342 -80.1282 1150.62 -249.286 1159.76 -11.897C1170.04 255.014 917.938 129.5 801.5 129.5Z"
          fill="#693017"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.medium, OFFSETS.bottomRight) }}
          d="M936.943 536.404C1041.44 514.415 1217.98 574.582 1368.44 611.147C1452.82 631.65 1594.34 615.162 1568.49 761.209C1536.18 943.769 1324.9 943.433 1108.01 921.814C891.125 900.195 334.454 1013.1 536.94 886.687C846.943 693.147 832.443 558.392 936.943 536.404Z"
          fill="#693017"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.medium, OFFSETS.bottomLeft) }}
          d="M753.5 1048.5C753.5 1215 99.3004 1131.25 -210.517 1030.41C-280.346 1007.68 -286.949 964.892 -279.267 822.482C-269.664 644.468 -99.3917 651.364 77.3124 679.305C254.016 707.245 480 507.305 547.5 679.305C606.691 830.132 753.5 882 753.5 1048.5Z"
          fill="#693017"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.medium, OFFSETS.topLeft) }}
          d="M-68.8338 634.293C-151.373 656.324 -171.2 756.678 -461.725 609.197C-527.206 575.956 -527.119 532.659 -497.533 393.144C-460.55 218.75 -173.217 -16.6106 -2.94874 38.288C167.319 93.1866 238.145 247.983 245.051 427.288C251.958 606.593 71.4325 596.855 -68.8338 634.293Z"
          fill="#693017"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.dark, OFFSETS.bottomRight) }}
          d="M1200.81 599.48C1253.54 532.265 1218.74 414.228 1539.58 357.491C1611.89 344.703 1637.85 379.359 1698.05 508.647C1773.31 670.256 1619.8 744.259 1450.72 802.716C1281.64 861.173 1167.3 1158.81 1017.32 974.575C848.681 767.428 1148.08 666.695 1200.81 599.48Z"
          fill="#5A2315"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.dark, OFFSETS.topRight) }}
          d="M1692.48 210.301C1287.6 205.564 1083.53 418.737 1064.7 120.077C1045.88 -178.584 585.587 -293.647 987.201 -374.51C1388.81 -455.372 1919.97 212.963 1692.48 210.301Z"
          fill="#5A2315"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.dark, OFFSETS.topLeft) }}
          d="M20.965 169.629C-111.231 129.414 -204.524 288.999 -222.77 199.556C-241.017 110.113 -62.9448 -158.438 34.9171 -238.971C132.779 -319.504 330.258 -597.143 483.832 -398.526C598.431 -250.313 396.751 -177.748 384.239 -5.29156C371.727 167.165 202.34 224.804 20.965 169.629Z"
          fill="#5A2315"
        />
        <path
          className="piano-wave"
          style={{ transform: buildTransform(feel.dark, OFFSETS.bottomLeft) }}
          d="M229.678 686.653C287.863 765.924 404.803 744.67 365.875 1119.08C357.102 1203.47 310.17 1221.73 146.756 1249.1C-57.5109 1283.33 -91.1592 1089.83 -102.502 883.768C-113.845 677.707 -409.452 459.26 -156.135 348.816C128.685 224.638 130.8 551.94 229.678 686.653Z"
          fill="#5A2315"
        />
      </svg>
    </div>
  );
};

export default PianoWaves;
