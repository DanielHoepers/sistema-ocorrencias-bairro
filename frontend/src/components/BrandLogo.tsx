export function BrandLogo() {
  return (
    <span className="brandMark" aria-hidden="true">
      <svg className="brandMapIcon" viewBox="0 0 40 40" focusable="false">
        <path className="brandMapRoad" d="M8 12.5H21.5C25 12.5 27.5 10.5 31.5 10.5" />
        <path className="brandMapRoad" d="M8 20H16.5C20 20 21.5 26.5 25.5 26.5H32" />
        <path className="brandMapRoad" d="M12.5 31V24.5C12.5 21 17 18.5 17 14.5V8" />
        <path className="brandMapPin" d="M28.5 17.8C28.5 22.2 23 27.5 23 27.5S17.5 22.2 17.5 17.8C17.5 14.7 20 12.2 23 12.2S28.5 14.7 28.5 17.8Z" />
        <circle className="brandMapDot" cx="23" cy="17.7" r="2.1" />
      </svg>
    </span>
  );
}
