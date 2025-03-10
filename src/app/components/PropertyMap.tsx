"use client";

import React, {
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import mapboxgl, { Map as MapboxMap, PointLike } from "mapbox-gl";
import { Polygon } from 'geojson';
import { mapboxAccessToken } from "../../config/config";
import { useFilter } from "@/context/FilterContext";
import LegendControl from "mapboxgl-legend";
import "mapboxgl-legend/dist/style.css";
import "../globals.css";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";
import { FillLayer } from "react-map-gl";
import { MapboxGeoJSONFeature } from "mapbox-gl";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const layerStyle: FillLayer = {
  id: "vacant_properties",
  type: "fill",
  source: "vacant_properties",
  "source-layer": "vacant_properties",
  paint: {
    "fill-color": [
      "match",
      ["get", "priority_level"], // get the value of the guncrime_density property
      "Low Priority",
      "#B0E57C", // Light Green
      "Medium Priority",
      "#FFD700", // Gold
      //"Medium Priority",
      //"#FF8C00", // Dark Orange
      "High Priority",
      "#FF4500", // Orange Red
      //"High Priority",
      //"#B22222", // FireBrick
      //"Top 1%",
      //"#8B0000", // Dark Rednp
      "#0000FF", // default color if none of the categories match
    ],
    "fill-opacity": 0.7,
  },
  metadata: {
    name: "Priority Level",
  },
};

const MapControls = () => (
  <>
    <GeolocateControl position="bottom-right" />
    <FullscreenControl position="bottom-right" />
    <NavigationControl showCompass={false} position="bottom-right" />
    <ScaleControl />
  </>
);

interface PropertyMapProps {
  setFeaturesInView: Dispatch<SetStateAction<any[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  selectedProperty: MapboxGeoJSONFeature | null;
  setSelectedProperty: (property: MapboxGeoJSONFeature | null) => void;
}
const PropertyMap: React.FC<PropertyMapProps> = ({
  setFeaturesInView,
  setLoading,
  selectedProperty,
  setSelectedProperty,
}) => {
  const { filter } = useFilter();
  const [popupInfo, setPopupInfo] = useState<any | null>(null);
  const [map, setMap] = useState<MapboxMap | null>(null);
  const legendRef = useRef<LegendControl | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  // filter function
  const updateFilter = () => {
    if (!map) return;

    const isAnyFilterEmpty = Object.values(filter).some((filterItem) => {
      return filterItem.values.length === 0;
    });

    if (isAnyFilterEmpty) {
      map.setFilter("vacant_properties", ["==", ["id"], ""]);
      return;
    }

    const mapFilter = Object.entries(filter).reduce(
      (acc, [property, filterItem]) => {
        if (filterItem.values.length) {
          acc.push(["in", property, ...filterItem.values]);
        }

        return acc;
      },
      [] as any[]
    );

    map.setFilter("vacant_properties", ["all", ...mapFilter]);
  };

  const onMapClick = (event: any) => {
    if (map) {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["vacant_properties"],
      });

      if (features.length > 0) {
        setSelectedProperty(features[0]);
        setPopupInfo({
          longitude: event.lngLat.lng,
          latitude: event.lngLat.lat,
          feature: features[0].properties,
        });
      } else {
        setSelectedProperty(null);
        setPopupInfo(null);
      }
    }
  };

  const handleSetFeatures = (event: any) => {
    if (!["moveend", "sourcedata"].includes(event.type)) return;
    if (!map) return;
    setLoading(true);

    const zoom = map.getZoom();

    let bbox: [PointLike, PointLike] | undefined = undefined;
    if (zoom < 14) {
      // get map size in pixels
      const { height, width } = map.getCanvas();
      bbox = [
        [0.25 * width, 0.25 * height],
        [0.75 * width, 0.75 * height],
      ];
    }
    const features = map.queryRenderedFeatures(bbox, {
      layers: ["vacant_properties"],
    });

    // Remove duplicate features (which can occur because of the way the tiles are generated)
    const uniqueFeatures = features.reduce((acc: any[], feature: any) => {
      if (!acc.find((f) => f.properties.OPA_ID === feature.properties.OPA_ID)) {
        acc.push(feature);
      }
      return acc;
    }, []);

    setFeaturesInView(uniqueFeatures);
    setLoading(false);
  };

  useEffect(() => {
    if (map) {
      if (!legendRef.current) {
        legendRef.current = new LegendControl();
        map.addControl(legendRef.current, "bottom-left");
      }
    }

    return () => {
      if (map && legendRef.current) {
        map.removeControl(legendRef.current);
        legendRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (map) {
      // Add Legend Control
      if (!legendRef.current) {
        legendRef.current = new LegendControl();
        map.addControl(legendRef.current, "bottom-left");
      }

      // Add Geocoder
      if (!geocoderRef.current) {
        const center = map.getCenter();
        geocoderRef.current = new MapboxGeocoder({
          accessToken: mapboxAccessToken,
          mapboxgl: mapboxgl,
          marker: false,
          proximity: {
            longitude: center.lng,
            latitude: center.lat,
          },
        });

        map.addControl(geocoderRef.current, "top-right");

        geocoderRef.current.on("result", (e) => {
          map.flyTo({
            center: e.result.center,
            zoom: 16,
          });
        });
      }
    }

    return () => {
      // Remove Legend Control
      if (map && legendRef.current) {
        map.removeControl(legendRef.current);
        legendRef.current = null;
      }

      // Remove Geocoder
      if (map && geocoderRef.current) {
        map.removeControl(geocoderRef.current);
        geocoderRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (map) {
      updateFilter();
    }
  }, [map, filter, updateFilter]);

  const id = selectedProperty?.properties?.OPA_ID ?? null;
  useEffect(() => {
    /** Ticket #87 - focus on map when a property is selected */
    if (id && map != null) {
      const features = map.queryRenderedFeatures(undefined, {
        layers: ["vacant_properties"],
      });
      const mapItem = features.find(feature => feature.properties?.OPA_ID === id);
  
      if (mapItem != null) {
        const coordinates = (mapItem.geometry as Polygon).coordinates[0];
  
        if (coordinates.length > 0) {
          // Filter out coordinates that are not available
          const validCoordinates = coordinates.filter(([x, y]) => !isNaN(x) && !isNaN(y));
  
          if (validCoordinates.length > 0) {
            const totalPoint = validCoordinates.reduce(
              (prevSum, position) => [prevSum[0] + position[0], prevSum[1] + position[1]],
              [0, 0],
            );
  
            let finalPoint = [totalPoint[0] / validCoordinates.length, totalPoint[1] / validCoordinates.length];
  
            // Check if the finalPoint is valid
            if (isNaN(finalPoint[0]) || isNaN(finalPoint[1])) {
              // Fallback to first coordinate of the polygon if finalPoint is invalid
              finalPoint = validCoordinates[0];
            }
  
            const pointForMap = { lng: finalPoint[0], lat: finalPoint[1] };
  
            map.flyTo({
              center: pointForMap,
            });
  
            setPopupInfo({
              longitude: finalPoint[0],
              latitude: finalPoint[1],
              feature: selectedProperty?.properties,
            });
          }
        }
      }
    }
  }, [id]);
  
  
  

  useEffect(
    () => {
      if (id == null) {
        setPopupInfo(null);
      }
    },
    [id]
  );

  const changeCursor = (e: any, cursorType: "pointer" | "default") => {
    e.target.getCanvas().style.cursor = cursorType;
  };

  // map load
  return (
    <div className="relative h-full w-full">
      <Map
        mapboxAccessToken={mapboxAccessToken}
        initialViewState={{
          longitude: -75.1652,
          latitude: 39.9526,
          zoom: 13,
        }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        onMouseEnter={(e) => changeCursor(e, "pointer")}
        onMouseLeave={(e) => changeCursor(e, "default")}
        onClick={onMapClick}
        interactiveLayerIds={["vacant_properties"]}
        onLoad={(e) => {
          setMap(e.target);
        }}
        onSourceData={(e) => {
          handleSetFeatures(e);
        }}
        onMoveEnd={handleSetFeatures}
        maxZoom={20}
        minZoom={10}
      >
        <MapControls />
        {popupInfo && (
         <Popup
         longitude={popupInfo.longitude}
         latitude={popupInfo.latitude}
         closeOnClick={false}
         onClose={() => setPopupInfo(null)}
       >
         <div>
           <p className="font-semibold text-md p-1">{popupInfo.feature.address}</p>
         </div>
       </Popup>
        )}
        <Source
          id="vacant_properties"
          type="vector"
          url={"mapbox://nlebovits.vacant_properties"}
        >
          <Layer {...layerStyle} />
        </Source>
      </Map>
    </div>
  );
};
export default PropertyMap;
