import { useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const goog = (): any => (window as any).google;

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function loadMapsScript() {
  if (!MAPS_API_KEY) return;
  if (document.querySelector('script[data-maps-loader]')) return;
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.dataset.mapsLoader = "1";
  document.head.appendChild(script);
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function PlacesAutocompleteInput({
  value,
  onChange,
  className,
  placeholder,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!inputRef.current || !MAPS_API_KEY) return;

    loadMapsScript();

    function init() {
      if (autocompleteRef.current) return;
      const Autocomplete = goog()?.maps?.places?.Autocomplete;
      if (!Autocomplete) return;
      autocompleteRef.current = new Autocomplete(inputRef.current, {
        types: ["address"],
        fields: ["formatted_address"],
      });
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place?.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    }

    if (goog()?.maps?.places?.Autocomplete) {
      init();
    } else {
      const interval = setInterval(() => {
        if (goog()?.maps?.places?.Autocomplete) {
          clearInterval(interval);
          init();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}
